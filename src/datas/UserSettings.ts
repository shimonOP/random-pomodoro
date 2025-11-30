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
    webPushEnabled: boolean, // WebPush通知の有効/無効
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
        webPushEnabled: false,
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