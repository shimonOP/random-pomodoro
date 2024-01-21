
type status  ="running" | "stable";
export class KeyShortCutter<T> {
    private _statusMap:Map<T,status>;
    public constructor(array:readonly T[]){
        const map = new Map<T,status>();
        for (const t of array) {
            map.set(t,"stable");
        }
        this._statusMap = map;
    }
    public setRunning(command: T) {
        if (this._statusMap.get(command) === "running") return;
        this._statusMap.set(command,"running")
    }
    public getStatus(command:T) {
        return this._statusMap.get(command);
    }
    public done(command:T){
        this._statusMap.set(command,"stable");
    }
}