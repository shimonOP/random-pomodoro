import { WEBPUSH_SERVER_URL } from '../config/webpush';

/**
 * WebPush通知サービス
 * ブラウザのプッシュ通知機能とWebPushサーバーとの連携を管理
 */

export interface ScheduledNotificationResponse {
  message: string;
  id: string;
  scheduledTime: number;
  scheduledDate: string;
}

export class WebPushService {
  private serverUrl: string = WEBPUSH_SERVER_URL;
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;

  /**
   * サービスワーカーの登録状態を確認
   */
  async isServiceWorkerSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * 通知権限をリクエスト
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    const permission = await Notification.requestPermission();
    console.log('Notification permission result:', permission);
    return permission;
  }

  /**
   * VAPID公開鍵を取得
   */
  async fetchVapidPublicKey(): Promise<string> {
    try {
      console.log('Fetching VAPID key from:', `${this.serverUrl}/vapid-public-key`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(`${this.serverUrl}/vapid-public-key`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch VAPID key: ${response.status} ${response.statusText}`);
        }
        const { publicKey } = await response.json();
        this.vapidPublicKey = publicKey; // Store the public key
        return publicKey;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('VAPID key fetch timed out after 5s. Is the server running and accessible?');
          throw new Error('VAPID key fetch timed out after 5s. Is the server running and accessible?');
        }
        // For other network errors or JSON parsing errors
        console.error('Failed to fetch VAPID public key due to network or parsing error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to fetch VAPID public key:', error);
      throw error;
    }
  }

  /**
   * サービスワーカーを登録
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    try {
      console.log('Registering Service Worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * プッシュ通知をサブスクライブ（このデバイス専用）
   */
  async subscribe(): Promise<PushSubscription> {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker is not supported');
      }

      if (!('PushManager' in window)) {
        throw new Error('Push API is not supported');
      }

      // 1. 権限の確認と要求
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // 2. VAPIDキーの取得
      const vapidPublicKey = await this.fetchVapidPublicKey();

      // 3. Service Workerの登録
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // 4. プッシュ通知の購読
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as any
        });
      }

      // 5. サーバーへ購読情報を送信
      await this.sendSubscriptionToServer(subscription);

      this.subscription = subscription;

      // ローカルストレージにエンドポイントを保存（これが重要）
      localStorage.setItem('webpush_endpoint', subscription.endpoint);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe - Detailed Error:', error);
      throw error;
    }
  }

  /**
   * プッシュ通知をアンサブスクライブ
   */
  async unsubscribe(): Promise<void> {
    try {
      if (!this.subscription) {
        const registration = await navigator.serviceWorker.ready;
        this.subscription = await registration.pushManager.getSubscription();
      }

      if (this.subscription) {
        await this.removeSubscriptionFromServer(this.subscription.endpoint);
        await this.subscription.unsubscribe();
        this.subscription = null;
        localStorage.removeItem('webpush_endpoint');
        console.log('Push subscription cancelled');
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  /**
   * 通知をスケジュール予約
   */
  async scheduleNotification(
    scheduledTime: number,
    title: string,
    body?: string,
    icon?: string,
    data?: any
  ): Promise<ScheduledNotificationResponse> {
    try {
      let endpoint = this.getEndpoint();

      if (!endpoint) {
        // エンドポイントがない場合、サブスクリプション状態を再確認
        const hasSubscription = await this.getSubscriptionStatus();
        if (hasSubscription) {
          endpoint = this.getEndpoint();
        }

        if (!endpoint) {
          const errorMsg = 'WebPush通知が有効になっていません。設定から有効にしてください。';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      }

      const response = await fetch(`${this.serverUrl}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          scheduledTime,
          title,
          body,
          icon,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule notification');
      }

      const result: ScheduledNotificationResponse = await response.json();
      localStorage.setItem('webpush_current_schedule_id', result.id);

      console.log('Notification scheduled:', result);
      return result;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  /**
   * スケジュール済み通知をキャンセル
   */
  async cancelScheduledNotification(scheduleId?: string): Promise<void> {
    try {
      const id = scheduleId || localStorage.getItem('webpush_current_schedule_id');

      if (!id) {
        return;
      }

      const response = await fetch(`${this.serverUrl}/schedule/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // 404なら既にないものとして扱う
        if (response.status !== 404) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to cancel scheduled notification');
        }
      }

      localStorage.removeItem('webpush_current_schedule_id');
      console.log('Scheduled notification cancelled:', id);
    } catch (error) {
      console.error('Failed to cancel scheduled notification:', error);
      throw error;
    }
  }

  /**
   * 即座に通知を送信（テスト用）
   */
  async sendNotification(
    title: string,
    body?: string,
    icon?: string,
    data?: any
  ): Promise<void> {
    try {
      let endpoint = this.getEndpoint();

      if (!endpoint) {
        await this.getSubscriptionStatus();
        endpoint = this.getEndpoint();
        if (!endpoint) {
          throw new Error('No subscription endpoint found. Please subscribe first.');
        }
      }

      const response = await fetch(`${this.serverUrl}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          title,
          body,
          icon,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send notification');
      }

      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * 現在のサブスクリプション状態を取得
   */
  async getSubscriptionStatus(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      this.subscription = subscription;

      if (subscription) {
        localStorage.setItem('webpush_endpoint', subscription.endpoint);
        return true;
      } else {
        localStorage.removeItem('webpush_endpoint');
        return false;
      }
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return false;
    }
  }

  /**
   * エンドポイントを取得
   */
  private getEndpoint(): string | null {
    if (this.subscription) {
      return this.subscription.endpoint;
    }
    return localStorage.getItem('webpush_endpoint');
  }

  /**
   * サブスクリプションをサーバーに送信
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    console.log('Sending subscription to:', `${this.serverUrl}/subscribe`);
    const response = await fetch(`${this.serverUrl}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to send subscription to server: ${response.status} ${text}`);
    }
  }

  /**
   * サーバーからサブスクリプションを削除
   */
  private async removeSubscriptionFromServer(endpoint: string): Promise<void> {
    const response = await fetch(`${this.serverUrl}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      // 既に削除されていてもエラーにしない
      if (response.status !== 404) {
        throw new Error('Failed to remove subscription from server');
      }
    }
  }

  /**
   * Base64文字列をUint8Arrayに変換
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
