type Holder = "no one" | "me" | "else"
export class UniqueInTabsExecuter {
    private whose: Holder = "no one"
    private channelName: string
    private channel: BroadcastChannel
    constructor(channelName: string) {
        this.channelName = channelName
        this.channel = new BroadcastChannel(channelName)
        this.channel.onmessage = (msg) => {
            console.log(msg)
            if (this.whose === "me")
                return
            if (msg.data === "mine") {
                this.whose = "else"
            } else if (msg.data === "free") {
                this.whose = "no one"
            }
        }
    }
    run(func: () => void) {
        if (this.whose === "me")
            return
        if (this.whose === "no one") {
            this.whose = "me"
            this.channel.postMessage("mine")
            func()
            this.channel.postMessage("free")
            this.whose = "no one"
            return true
        }
        return false
    }
}