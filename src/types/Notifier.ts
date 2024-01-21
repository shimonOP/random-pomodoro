import { lang2SpeechLang, Languages, languages } from './Languages';

export default class Notifier {
    private static _instance: Notifier;
    public notified = false;
    private constructor() { }
    public static get instance(): Notifier {
        // instanceがなければ生成
        if (!this._instance) {
            this._instance = new Notifier();
        }
        // 自身が持つインスタンスを返す
        return this._instance;
    }
    public notifyEnd(text: string, language: Languages, volume: number, force = false) {
        if (window.speechSynthesis.speaking && !force) return;
        this.speech(this.getEndSentence(text, language), language, volume)
        this.notified = true;
    }
    public notifyStart(text: string, language: Languages, volume: number, force = false) {
        if (window.speechSynthesis.speaking && !force) return;
        this.speech(this.getStartSentence(text, language), language, volume)
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