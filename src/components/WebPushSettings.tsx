import React, { useState, useEffect, useContext } from 'react';
import { WebPushService } from '../services/WebPushService';
import { TLLContext } from '../App';

interface WebPushSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const WebPushSettings: React.FC<WebPushSettingsProps> = ({
  enabled,
  onEnabledChange,
}) => {
  const tll = useContext(TLLContext);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service] = useState(() => new WebPushService());

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const supported = await service.isServiceWorkerSupported();
      if (!supported) {
        setError('このブラウザはプッシュ通知をサポートしていません');
        return;
      }

      const status = await service.getSubscriptionStatus();
      setIsSubscribed(status);

      // 親コンポーネントの状態と同期（オプション）
      if (status !== enabled) {
        // ここで自動的に同期するか、ユーザーに任せるかは要件次第だが、
        // 今回は表示だけ更新し、onEnabledChangeは呼ばない（無限ループ防止）
      }
    } catch (err) {
      console.error('Failed to check subscription status:', err);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!enabled) {
        // 有効化
        await service.subscribe();
        setIsSubscribed(true);
        onEnabledChange(true);
      } else {
        // 無効化
        await service.unsubscribe();
        setIsSubscribed(false);
        onEnabledChange(false);
      }
    } catch (err: any) {
      console.error('WebPush toggle failed:', err);
      setError(err.message || 'プッシュ通知の設定に失敗しました');
      // エラー時は状態を戻すだけでなく、ローカルストレージもクリアし、設定を無効化する
      localStorage.removeItem('webpush_endpoint');
      setIsSubscribed(false);
      onEnabledChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await service.sendNotification(
        'テスト通知',
        'Random Pomodoroからのテスト通知です',
        '/icon.png'
      );
    } catch (err: any) {
      console.error('Test notification failed:', err);
      setError(err.message || 'テスト通知の送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '16px' }}>
      <h3 style={{ marginTop: 0 }}>プッシュ通知設定</h3>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={isLoading}
            style={{ marginRight: '8px' }}
          />
          <span>プッシュ通知を有効にする</span>
        </label>
      </div>

      {enabled && isSubscribed && (
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={handleTest}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '送信中...' : 'テスト通知を送信'}
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '8px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          {error}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
        <p style={{ margin: '4px 0' }}>
          ステータス: {isSubscribed ? '登録済み' : '未登録'}
        </p>
        <p style={{ margin: '4px 0' }}>
          タイマー終了時にこのデバイスに通知が送信されます
        </p>
        <p style={{ margin: '4px 0', color: '#999', fontSize: '11px' }}>
          ※ プッシュ通知はモバイルデバイスでのみ利用可能です
        </p>
      </div>
    </div>
  );
};
