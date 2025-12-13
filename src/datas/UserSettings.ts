import { getBrowserLanguage } from "../langs/TransLangs"
import { Languages } from "../types/Languages"

export type UserSettings = {
    name: string,
    language: Languages,
    doAutoTimer: boolean,
    needSpeechNotify: boolean, // 後方互換性のため残す
    needSpeechNotifyOnStart: boolean,
    needSpeechNotifyOnEnd: boolean,
    doRestrictByTags: boolean,
    timerTags: string[],
    timerExTags: string[],
    notifyVolume: number,
    editIntervalOnTimerPane: boolean,
    editRuntimeOnTimerPane: boolean,
    todosFutureNum: number
    customWeightCode: string,
    useCustomWeight: boolean,
    diceRollDuration: number, // サイコロが回る秒数（ミリ秒単位）
    notifyRepeatCount: number, // 終了音声通知の繰り返し回数。-1で無限、0で1回のみ（繰り返さない）
    notifyInterval: number, // 終了音声通知の繰り返し間隔（秒）
}
export type SubscriptionPlan = "free" | "standard" | "pro" | "business" | "education"
export const createUserSettings = (data?: any) => {
    const userSettings: UserSettings = {
        name: "",
        language: getBrowserLanguage() === "ja" ? "japanese" : "english",
        doAutoTimer: false,
        needSpeechNotify: true, // 後方互換性
        needSpeechNotifyOnStart: false,
        needSpeechNotifyOnEnd: true,
        doRestrictByTags: false,
        timerTags: [],
        timerExTags: [],
        notifyVolume: 0.5,
        editIntervalOnTimerPane: false,
        editRuntimeOnTimerPane: false,
        todosFutureNum: 1,
        customWeightCode: "",
        useCustomWeight: false,
        diceRollDuration: 500, // ms デフォルト1秒
        notifyRepeatCount: -1,
        notifyInterval: 30,
    }
    if (data) {
        Object.assign(userSettings, data);
        // 古いデータからのマイグレーション
        if (data.needSpeechNotifyOnStart === undefined) {
            userSettings.needSpeechNotifyOnStart = data.needSpeechNotify ?? true;
        }
        if (data.needSpeechNotifyOnEnd === undefined) {
            userSettings.needSpeechNotifyOnEnd = data.needSpeechNotify ?? true;
        }
    }
    return userSettings
}
export const initialize = (userSettings: UserSettings) => {
    userSettings = createUserSettings()
}
export const userSettingsToData = (userSettings: UserSettings) => {
    return {
        userSettings: { ...userSettings },
        updatedAt: Date.now(),
    }
}