import { Todo, getTodosArray } from "./datas/Todo";
import {TodoRecord} from "./datas/TodoRecord"
import { UserInfo } from "./datas/UserInfo";
import { UserSettings } from "./datas/UserSettings";
import { createUserInfo } from "./datas/UserInfo";
import { createUserSettings } from "./datas/UserSettings";

let todosDB:Todo[] = []
let recordsDB:TodoRecord[] = []
let userSettingsDB = createUserSettings()
let userInfoDB = createUserInfo()
export async function loadTodos() {
    return todosDB
}
export async function loadRecords() {
    return recordsDB
}
export async function loadUserSettings() {
    return userSettingsDB
}
export async function loadUserInfo() {
    return  userInfoDB
}
export async function saveData(todos:Map<string,Todo>,records:TodoRecord[],userSettings:UserSettings,userInfo:UserInfo){
    todosDB = getTodosArray(todos).filter(t => !t.needDelete)
    recordsDB = records
    userSettingsDB = userSettings
    userInfoDB = userInfo
}