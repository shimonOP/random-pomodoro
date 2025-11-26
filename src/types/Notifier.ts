import { lang2SpeechLang, Languages, languages } from './Languages';

export default class Notifier {
    private static _instance: Notifier;
    public notified = false;
    private notificationPermission: NotificationPermission = 'default';

    private constructor() {
        this.requestNotificationPermission();
    }

    public static get instance(): Notifier {
        // instanceがなければ生成
        if (!this._instance) {
            this._instance = new Notifier();
        }
        // 自身が持つインスタンスを返す
        return this._instance;
    }

    private async requestNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = await Notification.requestPermission();
        }
    }

    private showBrowserNotification(title: string, body: string) {
        if ('Notification' in window && this.notificationPermission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                requireInteraction: false,
                silent: true,
            });

            // 通知をクリックしたときにタブにフォーカス
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    public notifyEnd(text: string, language: Languages, volume: number, force = false) {
        if (window.speechSynthesis.speaking && !force) return;
        const message = this.getEndSentence(text, language);
        this.speech(message, language, volume);
        this.notified = true;
    }

    public notifyEndWithBrowser(text: string, language: Languages, volume: number) {
        const message = this.getEndSentence(text, language);
        console.log("hrebbb");
        this.showBrowserNotification('Timer Completed', message);
        // 音声通知も一緒に実行
        // this.notifyEnd(text, language, volume);
    }

    public notifyStart(text: string, language: Languages, volume: number, force = false) {
        if (window.speechSynthesis.speaking && !force) return;
        const message = this.getStartSentence(text, language);
        this.speech(message, language, volume);
        this.notified = true;
    }
    private async speech(text: string, language: Languages, volume: number) {

        const msg = new SpeechSynthesisUtterance();
        msg.lang = lang2SpeechLang(language); //言語
        msg.text = text;
        msg.volume = volume;
        window.speechSynthesis.speak(msg);
    }
    private getEndSentence(text: string, language: Languages) {
        switch (language) {
            case "japanese":
                return text + "が終わりました"
            case "english":
            default:
                return text + " is over."
        }
    }
    private getStartSentence(text: string, language: Languages) {
        switch (language) {
            case "japanese":
                return "次は" + text + "です。"
            case "english":
            default:
                return "Next is " + text;
        }
    }
}