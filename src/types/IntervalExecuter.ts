
//実行間隔を管理するクラス
type State = {
    type: "Idling"
} | {
    type: "Executing"
} | {
    type: "ExecutingWithNext"
    nextfunc: () => void
} | {
    type: "InInterval"
} | {
    type: "InIntervalWithFunc"
    func: () => void
}

export class IntervalExecuter {
    public span: number = 2;//sec
    private _state: State = { type: "Idling" }
    public set state(s: State) {
        if (this.debug) console.log(`${this._state.type}=>${s.type}`)
        this._state = s;
    }
    public debug = false;
    constructor(span?: number) {
        if (span)
            this.span = span
    }
    public executeLater = (func: () => {} | void) => {
        this.onReceiveFunction(func);
    }
    onReceiveFunction = async (func: () => void) => {
        switch (this._state.type) {
            case "Idling":
                this.state = ({ type: "Executing" });
                await func()
                this.onFucntionIsOver()
                break;
            case "Executing":
                this.state = ({ type: "ExecutingWithNext", nextfunc: func })
                break;
            case "ExecutingWithNext":
                this.state = ({ type: "ExecutingWithNext", nextfunc: func })
                break;
            case "InInterval":
            case "InIntervalWithFunc":
                this.state = ({ type: "InIntervalWithFunc", func });
                break;
        }
    }
    onTimeIsOver = async () => {
        switch (this._state.type) {
            case "InInterval":
                this.state = ({ type: "Idling" });
                break;
            case "InIntervalWithFunc":
                const func = this._state.func
                this.state = ({ type: "Executing" })
                await func()
                this.onFucntionIsOver()
        }
    }
    private onFucntionIsOver = async () => {
        switch (this._state.type) {
            case "Executing":
                this.state = ({ type: "InInterval" });
                setTimeout(() => {
                    this.onTimeIsOver();
                }, 1000 * this.span);
                break;
            case "ExecutingWithNext":
                const func = this._state.nextfunc
                this.state = ({ type: "InIntervalWithFunc", func });
                setTimeout(() => {
                    this.onTimeIsOver();
                }, 1000 * this.span);
                break;
            default:
                console.log(this._state)
                break;
        }
    }
}