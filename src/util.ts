
export function mapToValueArray<T>(map: Map<any, T>) {
    return Array.from(map.values());
}
export function copyMap(map: Map<any, any>) {
    return new Map(map)
}
export type TimeUnit = 'miliseconds' | 'seconds' | 'minutes' | 'hours' | 'day' | 'week' | 'month' | 'year';
export type shortTimeUnit = 'miliseconds' | 'seconds' | 'minutes' | 'hours';
export function secondsToMaxTimeUnit(sec: number): (number | TimeUnit)[] {
    if (sec % 3600 * 24 * 365 === 0) return [sec / 3600 / 24 / 365, "year"];
    if (sec % 3600 * 24 * 30 === 0) return [sec / 3600 / 24 / 30, "month"];
    if (sec % 3600 * 24 * 7 === 0) return [sec / 3600 / 24 / 7, "week"];
    if (sec % 3600 * 24 === 0) return [sec / 3600 / 24, "day"];
    if (sec % 3600 === 0) return [sec / 3600, "hours"];
    if (sec % 60 === 0) return [sec / 60, "minutes"];
    return [sec, "seconds"];
}
export function convertTime(source: number, sourceTimeUnit: TimeUnit, destTimeUnit: TimeUnit) {
    //まず秒単位に直す係数を作る
    let a: number;
    switch (sourceTimeUnit) {
        case 'miliseconds':
            a = 1 / 1000;
            break;
        case 'seconds':
            a = 1;
            break;
        case 'minutes':
            a = 60;
            break;
        case 'hours':
            a = 3600;
            break;
        case 'day':
            a = 3600 * 24;
            break;
        case 'week':
            a = 3600 * 24 * 7;
            break;
        case 'month':
            a = 3600 * 24 * 30;
            break;
        case 'year':
            a = 3600 * 24 * 365;
            break;
    }
    switch (destTimeUnit) {
        case 'miliseconds':
            return (source * a * 1000);
        case 'seconds':
            return (source * a);
        case 'minutes':
            return (source * a) / 60;
        case 'hours':
            return (source * a) / 3600;
        case 'day':
            return (source * a) / 3600 / 24;
        case 'week':
            return (source * a) / 3600 / 24 / 7;
        case 'month':
            return (source * a) / 3600 / 24 / 30;
        case 'year':
            return (source * a) / 3600 / 24 / 365;
    }
}
export function extractTime(source: number, sourceTimeUnit: shortTimeUnit, extractTimeUnit: shortTimeUnit) {
    //まず秒単位に直す係数を作る
    let a: number;
    switch (sourceTimeUnit) {
        case 'miliseconds':
            a = 1 / 1000;
            break;
        case 'seconds':
            a = 1;
            break;
        case 'minutes':
            a = 60;
            break;
        case 'hours':
            a = 3600;
            break;
    }
    switch (extractTimeUnit) {
        case 'miliseconds':
            return Math.floor((source * a * 1000) % 60);
        case 'seconds':
            return Math.floor((source * a) % 60);
        case 'minutes':
            return Math.floor((source * a / 60) % 60);
        case 'hours':
            return Math.floor((source * a / 3600));
    }
}
export function isSameDay(date1: Date, date2: Date) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}
export function withoutDuplicate(array: any[]) {
    return Array.from(new Set(array))
}
export const probsToString = (probs: number[]) => {
    let percents = probs.map(p => (p * 100).toFixed(1));
    let sumProb = (probs.reduce((p, c) => p * c, 1) * 100).toFixed(1);
    let count = 0;
    let res = "";
    for (const p of percents) {
        if (count === 0) res = res + p;
        else {
            res += "*" + p;
        }
        count++;
    }
    if (count >= 2) {
        res += "=" + sumProb;
    }
    res += "%";
    return res;
}
export function keyExists(obj: any, key: string) {
    return key in obj;
}
export function disableKeyBoardShortCut(keys: readonly string[]) {
    //TODO:抽象化しろ
    const token = "+";
    const keysArray = keys.filter(key => key.startsWith("ctrl")).map((key) => {
        return key.split(token);
    });
    for (const keys of keysArray) {
        document.addEventListener("keydown", function (event) {
            if (event.ctrlKey) {
                if (event.key === keys.slice(-1)[0]) {
                    event.preventDefault();
                }
            }
        });
    }
}
//sec
export function calcTimeUntilTomorrow() {
    const now = new Date();
    const then = new Date(now);
    then.setHours(24, 0, 0, 0);
    return (then.getTime() - now.getTime()) / 1000;
}
export const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}
type ValueOf<T> = T[keyof T];

type NonEmptyArray<T> = [T, ...T[]]

type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

//key漏れを防ぐための
export function stringUnionToArray<T>() {
    return <U extends NonEmptyArray<T>>(...elements: MustInclude<T, U>) => elements;
}
export function downloadString(text: string, fileType: string, fileName: string) {
    var blob = new Blob([text], { type: fileType });

    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}
export function getYYYYMMDD() {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const yyyy = y.toString();
    const mm = ("00" + m).slice(-2);
    const dd = ("00" + d).slice(-2);

    const yyyymmdd = yyyy + mm + dd;
    return yyyymmdd
}
export function isSameUnOrder(a: any[], b: any[]) {
    if (a === b) {
        return true;
    }
    if (a.length !== b.length) {
        return false;
    }
    const setA = new Set(a);
    return b.every((element) => setA.has(element));
}

export const timeToString = (time: number) => {
    const hour = extractTime(time, 'miliseconds', 'hours');
    const minute = extractTime(time, 'miliseconds', 'minutes');
    const second = extractTime(time, 'miliseconds', 'seconds');
    return (hour === 0 ? "" : hour + ":") + toTwoDigits(minute) + ":" + toTwoDigits(second)
}
export const toTwoDigits = (number: number) => {
    return ("0" + number).slice(-2)
}
export const intervalToString = (interval: number) => {
    const date = new Date();
    date.setTime(date.getTime() + interval * 1000);
    let dateString = date.toLocaleString();
    let strs = dateString.split(":");
    let tail = strs.pop()
    let ampm = tail?.includes("PM") ? "PM" : "AM"
    return strs.join(":") + " " + ampm;
}
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}