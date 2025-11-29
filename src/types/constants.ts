
export const Document_Title = "Random Pomodoro";
export const DocumentTitle_WhileSync = "...saving";

export const Mobile_BreakPoint = 600;
export const Tablet_BreakPoint = 900;
export const Max_Tablet_Width = 1111;
export const Max_Todo_Title = 24;
export const Max_Todo_Memo = 2000;
export const Max_TagName_Length = 24;
export const Max_Todo_Tags = 20;
export const Max_Pie_Todos = 20;
export const Max_Weight_Length = 5;
export const Max_Runtime_Length = 5;
export const Max_Interval_Length = 5;

export const TodoTitle_MaxLength = 40;

export const S_A = 0.8;
export const MemoTextArea_Height = 100 * S_A;
export const Drawer_Width = 280 * S_A;
export const AboveAppContentArea_MinHeight = 30 * S_A;
export const TodoPane_PC_Width = 400 * S_A;
export const TimerCard_PC_Width = 256 * S_A;
export const Font_Size = 16 * S_A;
export const TreeView_MaxWidth = 320 * S_A;
export const Card_PaddingY = 2 * S_A;
export const Card_PaddingX = 8 * S_A;
export const Button1_Size = 24 * S_A;
export const Button2_Size = 50 * S_A + '%';
const TimerTitle_FontSize_Small = 15 * S_A;
const TimerTitle_FontSize_Midium = 20 * S_A;
const TimerTitle_FontSize_Big = 28 * S_A;
export const IntervalInTimer_Height = 36 * S_A;
export const ElapsedTime_FontSize = 32 * S_A;
export const ReminningTime_FontSize = 24 * S_A;
export const TagsInputField_MaxHeight = 150 * S_A;
export const TodayTotalTime_FontSize = 14 * S_A;
export const TodosCounts_FontSize = 12 * S_A;
export const TodoBreadCrumbs_FontSize = 12 * S_A;
export const TodoStatus_FontSize = 12 * S_A;
export const TimerProbability_FontSize = 12 * S_A;
export const TodayTotalTimeR_FontSize = 12 * S_A;
export const TimerTitle_FontSize = (str: string) => {
    return (
        str.length < 10 ? TimerTitle_FontSize_Big :
            str.length < 20 ? TimerTitle_FontSize_Midium :
                TimerTitle_FontSize_Small
    )
}
export const Emoji_Faces = ["😐", "😬", "🙄", "😒", "😏", "😑", "🤐", "🤨"]
export const GreenColorCode = '#3cb371'
export const LightGreyColorCode = "rgb(183, 188, 191)";
export const IndigoColorCode = '#2244CC';
export const RoyalBlueColorCode = "#4169E1"

export const timerRuntimeSliderMarks = [
    {
        value: 3,
        label: '3m',
    },
    {
        value: 15,
        label: '15m',
    },
    {
        value: 30,
        label: '30m',
    },
    {
        value: 60,
        label: '60m',
    },
];
export const timerIntervalSliderMarks_min =
    [
        {
            value: 1 * 60,
            label: '1h',
        },
        {
            value: 6 * 60,
            label: '6h',
        },
        {
            value: 12 * 60,
            label: '12h',
        },
        {
            value: 24 * 60,
            label: '24h',
        },
    ]
export const timerIntervalSliderMarks_day =
    [
        {
            value: 30,
            label: '1m',
        },
        {
            value: 30 * 6,
            label: '6m',
        },
        {
            value: 365,
            label: '1y',
        },
    ];