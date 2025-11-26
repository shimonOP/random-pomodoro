
//対応言語
export type TranslationLanguages = "en" | "ja"
const defaultLang = "en";
export const getBrowserLanguage = (): TranslationLanguages => {
    const l = (window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.language;
    if (l === "ja") return "ja";
    else return "en";
}
export type howToUseSentenses =
    "HTUS1"
//SCK = short cut key
export type transKeyBoardShortCutHelps =
    "RollDiceSCK" |
    "DoneSCK" |
    "AddChildSCK" |
    "AddBrotherSCK" |
    "AddTodoInboxSCK" |
    "FMakeCompleteSCK" |
    "RMakeCompleteSCK" |
    "ShowKeyBoardShortCutKeyHelpSCK" |
    "ShowSearchTodoDialogSCK"
    ;
export type transDescriptions =
    "Name" |
    "Settings" |
    "Language" |
    "Others" |
    "Account" |
    "Total" |
    "Today" |
    "H" |
    "M" |
    "Sec" |
    "Min" |
    "Hour" |
    "Day" |
    "Week" |
    "Month" |
    "Year" |
    "(" |
    ")" |
    "Weight" |
    "RunTime" |
    "Interval" |
    "Reset" |
    "Done" |
    "Start" |
    "StartSoon" |
    "Let'sTry" |
    "CatchSentense1" |
    "YouCanFocus" |
    "ProfileAndSettings" |
    "ConsiderCondition" |
    "AddTodoAtTheSameLevel" |
    "AddSubTodo" |
    "MoveTo" |
    "NotSelectTodoIfSubTodosDisable" |
    "CopyRuntimeToSub" |
    "CopyDefaultIntervalToSub" |
    "CountOfTodosIsMax" |
    "Archive" |
    "TimerSettings" |
    "NotifyBySpeech" |
    "NotifyBySpeechOnStart" |
    "NotifyBySpeechOnEnd" |
    "SpeechLanguage" |
    "NotifyToDeskTop" |
    "Volume" |
    "DiceRollDuration" |
    "AutoRoll" |
    "UseTags" |
    "Continue" |
    "SignOut" |
    "TrialTask1Title" |
    "TrialTask2Title" |
    "TrialTask3Title" |
    "ContinueWithGoogle" |
    "KeyBoardShortCutHelp" |
    "CopySuccess" |
    "HomePaneBody1" |
    "HowToUse" |
    "HowToUse1" |
    "HowToUse2" |
    "HowToUse3" |
    "HomePaneBody4" |
    "HomePaneBody5" |
    "ContactUs" |
    "PrivacyPolicy" |
    "TermsOfService" |
    "GoToArchive" |
    "SetTaskToTimer" |
    "ReturnTask" |
    "AddATask" |
    "RollDice" |
    "InboxDescription" |
    "DoForceSpeechDescription" |
    "Delete" |
    "DeleteAll" |
    "EditIntervalOnTimerPane" |
    "EditRunTimeOnTimerPane" |
    "OffTime" |
    "NumOfTodosFuture" |
    "InitialTodoWork" |
    "InitialTodoStudy" |
    "InitialTodoCleaning" |
    "InitialTodoBreak" |
    "InitialTodoEntertainment" |
    "UseCustomWeight" |
    "CustomWeightTips1" |
    "CustomWeightTips2" |
    "CustomWeightTips3" |
    "CustomWeightTips4" |
    "CustomWeightTips5" |
    "CustomWeightTips6" |
    "CustomWeightTips7" |
    "EnterShiftEnterAtSearchTodoDialog" |
    "InterruptTodo" |
    "AppendTodo" |
    "IsFavorite" |
    "IsForcedLeaf" |
    "PickFromSubTodos" |
    "UpdateIntervalBySliderInterval"
    ;//@@Keys
type transSentenses = transDescriptions | transKeyBoardShortCutHelps
export class TLL {
    public lang: TranslationLanguages = defaultLang;
    constructor(lang?: TranslationLanguages) {
        if (lang) this.lang = lang;
    }
    public t = (sentence: transSentenses): string => {
        switch (this.lang) {
            case "ja":
                switch (sentence) {
                    case "Name":
                        return "名前"
                    case "Settings":
                        return "設定"
                    case "Language":
                        return "言語"
                    case "Others":
                        return "その他"
                    case "Account":
                        return "アカウント"
                    case "Total":
                        return "合計"
                    case "Today":
                        return "Today"
                    case "H":
                        return "h"
                    case "M":
                        return "min"
                    case "Sec":
                        return "秒"
                    case "Min":
                        return "分"
                    case "Hour":
                        return "時間"
                    case "Day":
                        return "日"
                    case "Week":
                        return "週"
                    case "Month":
                        return "月"
                    case "Year":
                        return "年"
                    case "(":
                        return "（"
                    case ")":
                        return "）"
                    case "Weight":
                        return "weight"
                    case "RunTime":
                        return "実行時間（分）"
                    case "Interval":
                        return "休止間隔"
                    case "Reset":
                        return "リセット"
                    case "Done":
                        return "できた"
                    case "Start":
                        return "始める"
                    case "StartSoon":
                        return "いますぐ始める"
                    case "Let'sTry":
                        return "何をするかはサイコロ次第 "
                    case "CatchSentense1":
                        return "todolist + サイコロでタスク管理"
                    case "YouCanFocus":
                        return "将来が分からないからこそ今に集中できます"
                    case "ProfileAndSettings":
                        return "プロフィール・設定"
                    case "ConsiderCondition":
                        return "条件込み"
                    case "AddTodoAtTheSameLevel":
                        return "タスクを追加"
                    case "AddSubTodo":
                        return "サブタスクを追加"
                    case "MoveTo":
                        return "移動"
                    case "NotSelectTodoIfSubTodosDisable":
                        return "サブタスクが選ばれないときは自分も選ばれない"
                    case "CopyRuntimeToSub":
                        return "実行時間をサブタスクにコピーする"
                    case "CopyDefaultIntervalToSub":
                        return "休止間隔をサブタスクにコピーする"
                    case "CountOfTodosIsMax":
                        return "ToDoの数が最大に達しました。必要のないものを削除してください。"
                    case "Archive":
                        return "ごみ箱"
                    case "TimerSettings":
                        return "設定"
                    case "NotifyBySpeech":
                        return "音声による通知"
                    case "NotifyBySpeechOnStart":
                        return "開始時に音声で通知"
                    case "NotifyBySpeechOnEnd":
                        return "終了時に音声で通知"
                    case "SpeechLanguage":
                        return "音声の言語"
                    case "NotifyToDeskTop":
                        return "デスクトップに通知する"
                    case "Volume":
                        return "ボリューム"
                    case "DiceRollDuration":
                        return "サイコロが回る秒数"
                    case "AutoRoll":
                        return "自動でサイコロを回す"
                    case "UseTags":
                        return "タグを使う"
                    case "SignOut":
                        return "Log out"
                    case "Continue":
                        return "続ける"
                    case "KeyBoardShortCutHelp":
                        return "キーボードショートカット一覧"
                    case "RollDiceSCK":
                        return "サイコロを振る"
                    case "DoneSCK":
                        return "タスクを行った"
                    case "AddChildSCK":
                        return "サブタスクを追加"
                    case "AddBrotherSCK":
                        return "同じ階層にタスクを追加"
                    case "AddTodoInboxSCK":
                        return "インボックスにタスクを追加"
                    case "FMakeCompleteSCK":
                        return "タスクを完了済みにする"
                    case "RMakeCompleteSCK":
                        return "実行中のタスクを完了済みにする"
                    case "ShowKeyBoardShortCutKeyHelpSCK":
                        return "ショートカットキー一覧を表示"
                    case "ShowSearchTodoDialogSCK":
                        return "検索窓を表示"
                    case "TrialTask1Title":
                        return "勉強を頑張る"
                    case "TrialTask2Title":
                        return "仕事をする"
                    case "TrialTask3Title":
                        return "映画で息抜き"
                    case "ContinueWithGoogle":
                        return "Googleで続ける"
                    case "CopySuccess":
                        return "コピーしました"
                    case "HomePaneBody1":
                        return "このアプリはランダムにタスクを実行するためのアプリです。"
                    case "HowToUse":
                        return "<使い方>"
                    case "HowToUse1":
                        return "・右上の「+」ボタンを押すと、新しいToDoリストを作成できます。"
                    case "HowToUse2":
                        return "・"
                    case "HowToUse3":
                        return "ボタンをクリックすると、ToDoリスト内からランダムに一つのタスクが選ばれるため、そのタスクに取り組むことができます。"
                    case "HomePaneBody4":
                        return "全てのデータはブラウザに保存されるのでオフラインでも使用可能です。"
                    case "HomePaneBody5":
                        return "左下のexportボタンからアプリ内の全データをダウンロードできます。"
                    case "ContactUs":
                        return "お問い合わせ"
                    case "PrivacyPolicy":
                        return "プライバシーポリシー"
                    case "TermsOfService":
                        return "利用規約"
                    case "GoToArchive":
                        return "このToDoを削除する"
                    case "SetTaskToTimer":
                        return "タイマーにセット"
                    case "ReturnTask":
                        return "todolistに戻す"
                    case "AddATask":
                        return "ToDoを追加する"
                    case "RollDice":
                        return "ロールダイス"
                    case "InboxDescription":
                        return "＋ボタンクリック時にこのToDo下に追加される"
                    case "DoForceSpeechDescription":
                        return "常に音声によって読まれる"
                    case "Delete":
                        return "完全に削除する"
                    case "DeleteAll":
                        return "全てのToDoを完全に削除する"
                    case "EditIntervalOnTimerPane":
                        return "休止間隔を変更できるスライダーがタイマーの下に表示される"
                    case "EditRunTimeOnTimerPane":
                        return "実行時間を変更できるスライダーがタイマーの下に表示される"
                    case "OffTime":
                        return "休止時間"
                    case "NumOfTodosFuture":
                        return "サイコロを振った時に決まるToDoの数（1推奨）"
                    case "InitialTodoWork":
                        return "作業"
                    case "InitialTodoStudy":
                        return "勉強"
                    case "InitialTodoCleaning":
                        return "掃除"
                    case "InitialTodoBreak":
                        return "休憩"
                    case "InitialTodoEntertainment":
                        return "娯楽"
                    case "UseCustomWeight":
                        return "カスタムweightを有効化する"
                    case "CustomWeightTips1":
                        return "このコードはtodoのWeightを計算する時（例えばサイコロを回す時）に実行されます。"
                    case "CustomWeightTips2":
                        return "参照できる変数(console.logで確認してください):"
                    case "CustomWeightTips3":
                        return ""
                    case "CustomWeightTips4":
                        return "- todos:すべてのtodo"
                    case "CustomWeightTips5":
                        return "- records: それまでに実行されたタスクの情報"
                    case "CustomWeightTips6":
                        return "- date: 実行時の時刻"
                    case "CustomWeightTips7":
                        return `
                        Map<todoのid:string,todoのweight:number>をreturnしてください。
                        runボタンを押せばこのコードが実行されます。テストにご活用ください。
                        setボタンを押さない限り適用されません。`
                    case "EnterShiftEnterAtSearchTodoDialog":
                        return "enter: to edit, shiftEnter: to timer"
                    case "InterruptTodo":
                        return "割り込み"
                    case "AppendTodo":
                        return "追加"
                    case "IsFavorite":
                        return "お気に入り"
                    case "IsForcedLeaf":
                        return "サブタスクを選出しない"
                    case "PickFromSubTodos":
                        return "子を選出"
                    case "UpdateIntervalBySliderInterval":
                        return "反映させる"
                    //@@japanese
                }
            // eslint-disable-next-line no-fallthrough
            case "en":
                switch (sentence) {
                    case "Name":
                        return "Name"
                    case "Settings":
                        return "Settings"
                    case "Language":
                        return "Language"
                    case "Others":
                        return "Others"
                    case "Account":
                        return "Account"
                    case "Total":
                        return "Total"
                    case "Today":
                        return "Today"
                    case "H":
                        return "h"
                    case "M":
                        return "m"
                    case "Sec":
                        return "sec"
                    case "Min":
                        return "min"
                    case "Hour":
                        return "hours"
                    case "Day":
                        return "day"
                    case "Week":
                        return "week"
                    case "Month":
                        return "month"
                    case "Year":
                        return "year"
                    case "(":
                        return "("
                    case ")":
                        return ")"
                    case "Weight":
                        return "weight"
                    case "RunTime":
                        return "run time(m)"
                    case "Interval":
                        return "Interval"
                    case "Reset":
                        return "Reset"
                    case "Done":
                        return "Done"
                    case "Start":
                        return "Start"
                    case "StartSoon":
                        return "Start"
                    case "Let'sTry":
                        return "You can focus on your task without your decision."
                    case "CatchSentense1":
                        return "Todolist + RandomPicker, task management"
                    case "YouCanFocus":
                        return " You can focus on a task."
                    case "ProfileAndSettings":
                        return "Profile & Settings"
                    case "ConsiderCondition":
                        return "Consider condition."
                    case "AddTodoAtTheSameLevel":
                        return "Add a todo"
                    case "AddSubTodo":
                        return "Add a sub todo"
                    case "MoveTo":
                        return "Move to ..."
                    case "NotSelectTodoIfSubTodosDisable":
                        return "Not selected if all subtodos are disable."
                    case "CopyRuntimeToSub":
                        return "Copy runtime to subtodos."
                    case "CopyDefaultIntervalToSub":
                        return "Copy pause interval to subtodos."
                    case "CountOfTodosIsMax":
                        return "Count of todo is max. Please archive todos and delete from archive."
                    case "Archive":
                        return "Archive"
                    case "TimerSettings":
                        return "Settings"
                    case "NotifyBySpeech":
                        return "Notify by speech"
                    case "NotifyBySpeechOnStart":
                        return "Notify by speech on start"
                    case "NotifyBySpeechOnEnd":
                        return "Notify by speech on end"
                    case "SpeechLanguage":
                        return "Language of speech"
                    case "NotifyToDeskTop":
                        return "Notify to desktop"
                    case "Volume":
                        return "Volume"
                    case "DiceRollDuration":
                        return "Dice roll duration"
                    case "AutoRoll":
                        return "Auto Roll"
                    case "UseTags":
                        return "Use tags"
                    case "SignOut":
                        return "Sign out"
                    case "Continue":
                        return "Continue"
                    case "KeyBoardShortCutHelp":
                        return "Keyboard short cuts"
                    case "RollDiceSCK":
                        return "Roll dice."
                    case "DoneSCK":
                        return "Finish the task."
                    case "AddChildSCK":
                        return "Add child todo."
                    case "AddBrotherSCK":
                        return "Add todo at the same level."
                    case "AddTodoInboxSCK":
                        return "Add todo inbox."
                    case "FMakeCompleteSCK":
                        return "Make todo completed."
                    case "RMakeCompleteSCK":
                        return "Make running todo completed."
                    case "ShowKeyBoardShortCutKeyHelpSCK":
                        return "Show keyboard short cut keys"
                    case "ShowSearchTodoDialogSCK":
                        return "Show window to find todo"
                    case "TrialTask1Title":
                        return "Study"
                    case "TrialTask2Title":
                        return "Work"
                    case "TrialTask3Title":
                        return "Watching movie"
                    case "ContinueWithGoogle":
                        return "Continue with Google"
                    case "CopySuccess":
                        return "Copied successfully."
                    case "HomePaneBody1":
                        return "This application is for executing random tasks."
                    case "HowToUse":
                        return "<How to use the app>"
                    case "HowToUse1":
                        return "- You can create a new Todo list by clicking the \" + \" button on the top right."
                    case "HowToUse2":
                        return "- By clicking "
                    case "HowToUse3":
                        return "button, one task will be randomly selected from your Todo list, allowing you to tackle that task."
                    case "HomePaneBody4":
                        return "All data will be saved on the browser."
                    case "HomePaneBody5":
                        return "You can download all data in the app from the export button in the lower left corner."
                    case "ContactUs":
                        return "Contact us"
                    case "PrivacyPolicy":
                        return "Privacy policy"
                    case "TermsOfService":
                        return "Terms of service"
                    case "GoToArchive":
                        return "Delete this todo"
                    case "SetTaskToTimer":
                        return "Set to timer"
                    case "ReturnTask":
                        return "Return this todo to todolist"
                    case "AddATask":
                        return "Add a todo"
                    case "RollDice":
                        return "Roll the dice"
                    case "InboxDescription":
                        return "Todos will be added under this todo when the + button is clicked."
                    case "DoForceSpeechDescription":
                        return "Be always read by voice."
                    case "Delete":
                        return "Permanently delete"
                    case "DeleteAll":
                        return "Permanently delete all todos"
                    case "EditIntervalOnTimerPane":
                        return "Change pause interval in the timer pane."
                    case "EditRunTimeOnTimerPane":
                        return "Change run-time in the timer pane."
                    case "OffTime":
                        return "Off time"
                    case "NumOfTodosFuture":
                        return "The number of todos determined when rolling a dice (1 is recommended)."
                    case "InitialTodoWork":
                        return "Work"
                    case "InitialTodoStudy":
                        return "Study"
                    case "InitialTodoCleaning":
                        return "Cleaning"
                    case "InitialTodoBreak":
                        return "Break"
                    case "InitialTodoEntertainment":
                        return "Entertainment"
                    case "UseCustomWeight":
                        return "Enable custom weight."
                    case "CustomWeightTips1":
                        return "This code is executed when calculating the weight of a todo (for example, when rolling a dice). Please refer to the following variables (check with console.log):"
                    case "CustomWeightTips2":
                        return "Please refer to the following variables (check with console.log):"
                    case "CustomWeightTips3":
                        return ""
                    case "CustomWeightTips4":
                        return "- todos: All todos"
                    case "CustomWeightTips5":
                        return "- records: About executed tasks "
                    case "CustomWeightTips6":
                        return "- date: Time information at the moment of execution"
                    case "CustomWeightTips7":
                        return `
                        Please return a Map<todo's id: string, todo's weight: number>.
                        Press the "Run" button to execute this code. Please use it for testing purposes.
                        It will not take effect unless you press the "Set" button.
                        `
                    case "EnterShiftEnterAtSearchTodoDialog":
                        return "enter: to edit, shiftEnter: to timer"
                    case "InterruptTodo":
                        return "Interrupt"
                    case "AppendTodo":
                        return "Append"
                    case "IsFavorite":
                        return "Favorite"
                    case "IsForcedLeaf":
                        return "Sub tasks are unselectable."
                    case "PickFromSubTodos":
                        return "PickAChild"
                    case "UpdateIntervalBySliderInterval":
                        return "update"
                    //@@english
                }
        }
    }
}
export const browserLanguage = getBrowserLanguage();