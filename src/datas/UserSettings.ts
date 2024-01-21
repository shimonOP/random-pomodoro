import { Languages } from "../types/Languages"

export type UserSettings = {
    name: string,
    language: Languages,
    doAutoTimer: boolean,
    needSpeechNotify: boolean,
    doRestrictByTags: boolean,
    timerTags: string[],
    timerExTags: string[],
    notifyVolume: number,
    editIntervalOnTimerPane: boolean,
    editRuntimeOnTimerPane: boolean,
    todosFutureNum: number
    customWeightCode: string,
    useCustomWeight: boolean,
}
export type SubscriptionPlan = "free" | "standard" | "pro" | "business" | "education"
export const createUserSettings = (data?: any) => {
    const userSettings: UserSettings = {
        name: "",
        language: "english",
        doAutoTimer: false,
        needSpeechNotify: true,
        doRestrictByTags: false,
        timerTags: [],
        timerExTags: [],
        notifyVolume: 0.5,
        editIntervalOnTimerPane: false,
        editRuntimeOnTimerPane: false,
        todosFutureNum: 1,
        customWeightCode: "",
        useCustomWeight: false,
    }
    if (data) {
        Object.assign(userSettings, data);
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