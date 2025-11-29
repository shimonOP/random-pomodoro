import { Autocomplete, Box, Button, Checkbox, Collapse, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, Link, Menu, MenuItem, MenuList, Popover, Select, Stack, Switch, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { Dispatch, SetStateAction, useContext, useEffect, useState, useRef } from 'react';
import { calcDateOfOutBreak, getAncestors, getBrothers, getOffSprings, isInInterval, isInTags, isRootWithCondition, Todo, getLevel, getTodoOptions, TodoRawValues } from '../datas/Todo';
import { BsNodePlus } from 'react-icons/bs';
import { AiOutlineSisternode } from 'react-icons/ai'
import DeleteIcon from '@mui/icons-material/Delete';
import { convertTime, extractTime } from '../util';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import TodoPie from './TodoPie';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DriveFileMove, Start } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import TagsInputField from './TagsInputField';
import TodoBreadCrumbs from './TodoBreadCrumbs';
import { UserSettings } from '../datas/UserSettings';
import { Max_Interval_Length, Max_Runtime_Length, Max_TagName_Length, Max_Weight_Length, Max_Todo_Title, TodoStatus_FontSize, GreenColorCode } from '../types/constants';
import MemoTextArea from './MemoTextArea';
import { TLLContext } from '../App';
import { todaysTotal } from '../AppCore_';
import { TodoRecord } from '../datas/TodoRecord';
import { useDiceTodoStates } from '../contexts/DiceTodoContext';

type TodoPaneProps = {
    linkClicked: (todo: Todo) => void
    focusedOrRunning: "focused" | "running"
    addChildProcess: () => void
    addBrotherProcess: () => void
    moveToArchiveButtonClicked: () => void
    restoreFromTrashButtonClicked: () => void
    deleteButtonClicked: () => void
    titleRef: React.RefObject<HTMLDivElement>
    setFocused2RunningButtonClicked: () => void
    setPCRelation: (parent: Todo | undefined, child: Todo) => void
    calcWeight: (todo: Todo) => number
    interruptTodoFutureClicked: () => void
    appendTodoFutureClicked: () => void
    pickFromSubClicked: () => void
}
const timeUnitSource = ["seconds", "minutes", "hours", "day", "week", "month"] as const;
export type TimeUnit = (typeof timeUnitSource)[number];
const isTimeUnit = (str: string): str is TimeUnit => {
    return timeUnitSource.some((value) => value === str);
}

function secondsToMaxTimeUnit(sec: number, prevTimeUnit: TimeUnit): TimeUnit {
    if (sec === 0) return prevTimeUnit;
    if (sec % (3600 * 24 * 30) === 0) return "month";
    if (sec % (3600 * 24 * 7) === 0) return "week";
    if (sec % (3600 * 24) === 0) return "day";
    if (sec % (3600) === 0) return "hours";
    if (sec % (60) === 0) return "minutes";
    return "seconds";
}

const TodoPane = (props: TodoPaneProps) => {
    const {
        linkClicked,
        focusedOrRunning,
        addBrotherProcess,
        addChildProcess,
        moveToArchiveButtonClicked,
        restoreFromTrashButtonClicked: restoreFromTrashClicked,
        deleteButtonClicked,
        titleRef,
        setFocused2RunningButtonClicked,
        setPCRelation,
        calcWeight,
        interruptTodoFutureClicked,
        appendTodoFutureClicked,
        pickFromSubClicked,
    } = props
    const {todos, userSettings, records, focusedTodo, setTodoParameter} = useDiceTodoStates();
    if (focusedTodo === undefined || userSettings === undefined) return (<></>);
    const tags = focusedTodo.tags
    const runTime = focusedTodo.runTime
    const weight = focusedTodo.weight
    const interval = focusedTodo.interval
    const defaultInterval = focusedTodo.defaultInterval
    const [title, setTitle] = useState(focusedTodo.title)
    const [intervalTimeUnit, setIntervalTimeUnit] = useState<TimeUnit>("minutes");
    const [defaultIntervalTimeUnit, setDefaultIntervalTimeUnit] = useState<TimeUnit>("minutes");
    const [settingVisible, setSettingVisible] = useState(true);
    const [prevTodo, setPrevTodo] = useState<Todo | undefined>(undefined);
    const [todoMenuAnchorEl, setTodoMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [moveToMenuAnchorEl, setMoveToMenuAnchorEl] = useState<null | HTMLElement>(null);
    const moveToFormRef = React.useRef<HTMLDivElement>(null);
    const [considerCondition, setConsiderCondition] = React.useState(false);
    const timerTags = userSettings.timerTags;
    const timerExTags = userSettings.timerExTags;
    const [movetoOptions, setMoveToOptions] = useState<(Todo | string)[]>([]);
    const [editNotUntilAnchor, setEditNotUntilAnchor] = useState<null | Element>(null);
    const titleDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const TITLE_DEBOUNCE_MS = 300;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [memoModalOpen, setMemoModalOpen] = useState(false);

    useEffect(() => {
        setMoveToOptions(getTodoOptions(todos, ""))
    }, [todos])
    useEffect(() => {
        setTitle(focusedTodo.title)
    }, [focusedTodo.id])
    useEffect(() => {
        return () => {
            // クリーンアップ: タイマーをクリア
            if (titleDebounceTimerRef.current) {
                clearTimeout(titleDebounceTimerRef.current);
            }
        };
    }, [])
    const tll = useContext(TLLContext)
    if (focusedTodo) {
        if ((prevTodo && focusedTodo.id !== prevTodo.id) || (!prevTodo && focusedTodo)) {
            setIntervalTimeUnit(secondsToMaxTimeUnit(focusedTodo.interval, intervalTimeUnit))
            setDefaultIntervalTimeUnit(secondsToMaxTimeUnit(focusedTodo.defaultInterval, defaultIntervalTimeUnit))
            setPrevTodo(focusedTodo);
        } else if (!prevTodo && focusedTodo) {
            setPrevTodo(focusedTodo);
        }
    } else {
        return (<></>)
    }
    const renderAddButtons = () => {
        const abButton =
            <Button
                disabled={!Boolean(focusedTodo) || (focusedTodo && focusedTodo.isArchived)}
                onClick={addBrotherProcess}
            ><AiOutlineSisternode
                /></Button>
        const acButton =
            <Button
                disableElevation
                disabled={!Boolean(focusedTodo) || (focusedTodo && focusedTodo.isArchived)}
                onClick={addChildProcess}
            ><BsNodePlus
            ></BsNodePlus></Button>

        if (focusedTodo && !focusedTodo.isArchived) {
            return (
                <>
                    <Tooltip title={tll.t("AddTodoAtTheSameLevel")}>
                        {abButton}
                    </Tooltip>
                    <Tooltip title={tll.t('AddSubTodo')}>
                        {acButton}
                    </Tooltip>
                </>
            )
        } else {
            return (
                <>
                    {abButton}
                    {acButton}
                </>
            )

        }
    }
    const renderMoveButton = () => {
        const disabled = !Boolean(focusedTodo) || (focusedTodo && focusedTodo.isArchived)
        const button = (
            <Button
                disabled={disabled}
                onClick={(event) => {
                    setMoveToMenuAnchorEl(event.currentTarget);
                    //makeshift:ちょっと待たないとmoveToFormRefがnullのまま。多分、表示されないと参照できない。onshowみたいなイベントがあるといいけど
                    setTimeout(() => {
                        if (moveToFormRef.current) {
                            moveToFormRef.current.focus();
                        }
                    }, 200);
                }}
            >
                <DriveFileMove
                />
            </Button>
        )
        return (
            disabled ? button :
                <Tooltip title={tll.t("MoveTo")}>
                    {button}
                </Tooltip>
        )
    }
    const renderRemoveOrComeBackButton = () => {
        if (focusedOrRunning === "running") return (<></>);
        if (focusedTodo === undefined) return (<></>);
        if (focusedTodo.isArchived) {
            if (isRootWithCondition(focusedTodo, todos, (t: Todo) => t.isArchived)) {
                return (
                    <Tooltip title={tll.t("ReturnTask")}>
                        <Button
                            onClick={restoreFromTrashClicked}
                        ><RestoreFromTrashIcon></RestoreFromTrashIcon></Button>
                    </Tooltip>
                )
            } else {
                return (<></>)
            }
        } else {
            return (
                <Tooltip title={tll.t("GoToArchive")}>
                    <Button
                        onClick={moveToArchiveButtonClicked}
                    ><DeleteIcon></DeleteIcon></Button>
                </Tooltip>
            )
        }
    }
    const renderSetRunningTodoButton = () => {
        if (focusedOrRunning === "running") return (<></>);
        if (focusedTodo === undefined) return (<></>);
        if (focusedTodo.isArchived) return (<></>);
        return (
            <Tooltip title={
                <Stack>
                    <Stack >
                        <Link
                            style={{ "color": "white" }}
                            component="button"
                            onClick={setFocused2RunningButtonClicked}>
                            {tll.t("SetTaskToTimer")}
                        </Link>
                        <Link
                            style={{ "color": "white" }}
                            component="button"
                            onClick={interruptTodoFutureClicked}>
                            {tll.t("InterruptTodo")}
                        </Link>
                        <Link
                            style={{ "color": "white" }}
                            component="button"
                            onClick={appendTodoFutureClicked}>
                            {tll.t("AppendTodo")}
                        </Link>
                        <Link
                            style={{ "color": "white" }}
                            component="button"
                            onClick={pickFromSubClicked}>
                            {tll.t("PickFromSubTodos") + "  🎲"}
                        </Link>
                    </Stack>
                </Stack>
            }>
                <Button
                    onClick={setFocused2RunningButtonClicked}
                >
                    <Start></Start>
                </Button>
            </Tooltip>
        )
    }
    const renderDeleteButton = () => {
        if (focusedOrRunning === "running") return (<></>);
        if (focusedTodo === undefined) return (<></>);
        if (focusedTodo.isArchived) {
            return (<Button
                style={{ color: 'red' }}
                onClick={deleteButtonClicked}
            ><DeleteIcon></DeleteIcon></Button>)
        }
    }
    const renderIntervalOrDefaultIntervalField = (intervalOrDefaultInterval: "interval" | "defaultInterval") => {
        let value: number;
        let unitValue: TimeUnit;
        let setUnitValue: Dispatch<SetStateAction<TimeUnit>>;
        let textFieldOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (focusedTodo) {
                const d = event.target.value === '' ? 0 : Number.parseFloat(event.target.value);
                switch (intervalOrDefaultInterval) {
                    case "interval":
                        setTodoParameter(focusedTodo.id, { interval: convertTime(d, intervalTimeUnit, "seconds") })
                        break;
                    case "defaultInterval":
                        setTodoParameter(focusedTodo.id, { defaultInterval: convertTime(d, defaultIntervalTimeUnit, "seconds") })
                        break;
                }
            }
        }
        let timeChange: (unit: TimeUnit) => void

        switch (intervalOrDefaultInterval) {
            case "interval":
                unitValue = intervalTimeUnit;
                value = convertTime(interval, "seconds", unitValue);
                setUnitValue = setIntervalTimeUnit;
                timeChange = (unit) => {
                    setTodoParameter(focusedTodo!.id, { interval: convertTime(value, unit, "seconds") })
                }
                break;
            case "defaultInterval":
                unitValue = defaultIntervalTimeUnit;
                value = convertTime(defaultInterval, "seconds", unitValue);
                setUnitValue = setDefaultIntervalTimeUnit;
                timeChange = (unit) => {
                    setTodoParameter(focusedTodo!.id, { defaultInterval: convertTime(value, unit, "seconds") })
                }
                break;
        }
        const lastRunDate = new Date(focusedTodo.lastRunDateTime).toLocaleString()
        const label = intervalOrDefaultInterval === "interval" ?
            lastRunDate :
            tll.t("Interval")
        return (
            <Stack direction={"row"}>
                <TextField
                    disabled={!Boolean(focusedTodo)}
                    label={label}
                    variant={"standard"}
                    inputProps={{
                        inputMode: 'numeric',
                        maxLength: Max_Interval_Length
                    }}
                    value={value}
                    onChange={textFieldOnChange}
                    onKeyUp={(event) => {
                        if (event.key === "Enter") {
                            if (intervalOrDefaultInterval === "interval") {
                                setEditNotUntilAnchor(null);
                            }
                        }
                    }}
                />
                <Stack direction={"column"} justifyContent={"end"}>
                    <FormControl>
                        <Select
                            value={unitValue}
                            size="small"
                            onChange={(event) => {
                                if (isTimeUnit(event.target.value)) {
                                    const unit = event.target.value;
                                    if (focusedTodo) {
                                        timeChange(unit);
                                    }
                                    setUnitValue(unit);
                                } else {
                                    throw new Error("dropdownの値が想定範囲外です");
                                }
                            }}
                        >
                            <MenuItem value={"seconds"}>{tll.t("Sec")}</MenuItem>
                            <MenuItem value={"minutes"}>{tll.t("Min")}</MenuItem>
                            <MenuItem value={"hours"}>{tll.t("Hour")}</MenuItem>
                            <MenuItem value={"day"}>{tll.t("Day")}</MenuItem>
                            <MenuItem value={"week"}>{tll.t("Week")}</MenuItem>
                            <MenuItem value={"month"}>{tll.t("Month")}</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>
        )
    }
    const renderBreadCrumbs = () => {
        if (!focusedTodo) return;
        return (
            <Stack direction={'row'} sx={{ alignItems: "center" }} justifyContent="space-between">
                <TodoBreadCrumbs
                    todo={focusedTodo}
                    todos={todos}
                    linkOnClick={
                        linkClicked
                    }
                ></TodoBreadCrumbs>
                <Checkbox checked={focusedTodo.isCompleted} onChange={(e) => {
                    setTodoParameter(focusedTodo.id, { isCompleted: e.target.checked })
                }}></Checkbox>
            </Stack>
        )
    }

    const renderNotUntil = () => {
        let notUntilStr = "";
        const now = new Date()
        if (focusedTodo === undefined) {
            return <></>
        }
        if (focusedTodo.isArchived) {
            return <>{notUntilStr}<br></br></>;
        }
        const lastRunStr = (focusedTodo.sumRunTime ? new Date(focusedTodo.lastRunDateTime).toLocaleString() : "");
        notUntilStr = "NotUntil : " + (isInInterval(focusedTodo, now) ? calcDateOfOutBreak(focusedTodo).toLocaleString() : "null");
        return (
            <Stack direction={"row"} position={"relative"}>
                <Link component={"button"} color={isInInterval(focusedTodo, now) ? GreenColorCode : "inherit"} underline='none'
                    onClick={(event: React.MouseEvent) => {
                        setEditNotUntilAnchor(event.currentTarget);
                    }}>{notUntilStr}</Link>
                <div style={{ position: "absolute", right: 0 }}>{lastRunStr}</div>
                <br></br>
                <Popover
                    style={{ margin: "5px" }}
                    open={Boolean(editNotUntilAnchor)}
                    onClose={() => {
                        setEditNotUntilAnchor(null);
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    anchorEl={editNotUntilAnchor}>
                    <Box style={{ padding: "5px" }}>
                        {renderIntervalOrDefaultIntervalField("interval")}
                    </Box>
                </Popover>
            </Stack>
        );
    }
    const renderTodoPie = () => {
        if (focusedTodo === undefined ||
            getBrothers(focusedTodo, todos).length === 0) return <></>
        return <TodoPie todos={getBrothers(focusedTodo, todos).filter(t => {
            if (considerCondition) {
                const isEnable = calcWeight(t) !== 0;
                if (userSettings.doRestrictByTags) {
                    const intags = isInTags(t, todos, timerTags, timerExTags);
                    return intags && isEnable
                } else {
                    return isEnable
                }
            }
            return !t.isArchived
        })} legendVisible={true} weight={calcWeight}></TodoPie>
    }
    const renderTotal = () => {
        if (focusedTodo === undefined) return undefined;
        const sec = focusedTodo.sumRunTime;
        const displayMin = extractTime(sec, "seconds", "minutes")
        const displayHour = extractTime(sec, "seconds", "hours")
        return <Stack direction={"row"} spacing={1}>
            <div>{(tll.t("Total") + " : " + displayHour + "h" + displayMin + "m ")}</div>
            <div>{tll.t("Today") + " : " + todaysTotal(focusedTodo, records)}</div>
        </Stack>
    }
    const renderFavoriteSwitch = () => {
        if (focusedTodo === undefined) return <></>
        return <FormControlLabel control={<Switch checked={focusedTodo.isFavorite} onChange={(e) => {
            if (focusedTodo) {
                setTodoParameter(focusedTodo.id, { isFavorite: !focusedTodo.isFavorite })
            }
        }} />} label={tll.t("IsFavorite")} />
    }
    const renderForcedLeafSwitch = () => {
        if (focusedTodo === undefined) return <></>
        return <FormControlLabel control={<Switch checked={focusedTodo.isForcedLeaf} onChange={(e) => {
            if (focusedTodo) {
                setTodoParameter(focusedTodo.id, { isForcedLeaf: !focusedTodo.isForcedLeaf })
            }
        }} />} label={tll.t("IsForcedLeaf")} />
    }
    //ACD = All Children Disable
    const renderDisableIfACDSwitch = () => {
        if (focusedTodo === undefined) return <></>
        return <FormControlLabel control={<Switch checked={focusedTodo.disableIfAllChildrenDisable} onChange={(e) => {
            if (focusedTodo) {
                setTodoParameter(focusedTodo.id, { disableIfAllChildrenDisable: !focusedTodo.disableIfAllChildrenDisable })
            }
        }} />} label={tll.t("NotSelectTodoIfSubTodosDisable")} />
    }
    const renderPieSwitch = () => {
        if (focusedTodo === undefined) return <></>
        return <FormControlLabel control={<Switch checked={considerCondition} onChange={(e) => {
            setConsiderCondition(!considerCondition);
        }} />} label={tll.t("ConsiderCondition")} />
    }
    const renderForceSpeechSwitch = () => {
        if (focusedTodo === undefined) return <></>
        return <FormControlLabel control={<Switch checked={focusedTodo.doForceSpeech} onChange={(e) => {
            if (focusedTodo) {
                setTodoParameter(focusedTodo.id, { doForceSpeech: !focusedTodo.doForceSpeech })
            }
        }} />} label={tll.t("DoForceSpeechDescription")} />
    }
    const renderIsInboxSwitch = () => {
        if (focusedTodo === undefined) return <></>
        return <FormControlLabel control={<Switch checked={focusedTodo.isInbox} onChange={(e) => {
            if (focusedTodo) {
                setTodoParameter(focusedTodo.id, { isInbox: !focusedTodo.isInbox })
            }
        }} />} label={tll.t("InboxDescription")} />
    }
    const renderWeightLabel = () => {
        let str = "weight";
        return str;
    }
    const renderMenuButton = () => {
        return (
            <>
                <IconButton
                    disabled={!Boolean(focusedTodo) || (focusedTodo && focusedTodo.isArchived)}
                    onClick={(event) => {
                        setTodoMenuAnchorEl(event.currentTarget);
                    }}>
                    <MoreVertIcon
                    ></MoreVertIcon>
                </IconButton>
                <></>
                <Menu
                    anchorEl={todoMenuAnchorEl}
                    keepMounted
                    open={Boolean(todoMenuAnchorEl)}
                    onClose={() => {
                        setTodoMenuAnchorEl(null);
                    }}
                >
                    {renderMenuItems()}
                </Menu>
            </>
        )
    }
    const closeTodoMenu = () => {
        setTodoMenuAnchorEl(null);
    }
    const renderMenuItems = () => {
        const items =
            <MenuList>
                <MenuItem
                    key={"todoMenuItem0"}
                    disableRipple
                >
                    <>{renderFavoriteSwitch()}</>
                </MenuItem>
                <MenuItem
                    key={"todoMenuItem1"}
                    disableRipple
                >
                    <>{renderDisableIfACDSwitch()}</>
                </MenuItem>
                <MenuItem
                    key={"todoMenuItem1.1"}
                    disableRipple
                >
                    <>{renderForcedLeafSwitch()}</>
                </MenuItem>
                <MenuItem
                    key={"todoMenuItem2"}
                    onClick={() => {
                        closeTodoMenu();
                        if (focusedTodo) {
                            getOffSprings(focusedTodo, todos).forEach(c => {
                                setTodoParameter(c.id, { runTime: focusedTodo.runTime })
                            });
                        }
                    }}>
                    {tll.t("CopyRuntimeToSub")}
                </MenuItem>
                <MenuItem
                    key={"todoMenuItem3"}
                    onClick={() => {
                        closeTodoMenu();
                        if (focusedTodo) {
                            getOffSprings(focusedTodo, todos).forEach(c => {
                                setTodoParameter(c.id, { defaultInterval: focusedTodo.defaultInterval })
                            });
                        }
                    }}>
                    {tll.t("CopyDefaultIntervalToSub")}
                </MenuItem>
                <MenuItem
                    key={"todoMenuItem4"}
                    disableRipple
                >
                    <>{renderIsInboxSwitch()}</>
                </MenuItem>
                <MenuItem
                    key={"todoMenuItem5"}
                    disableRipple
                >
                    <>{renderForceSpeechSwitch()}</>
                </MenuItem>
            </MenuList>
        return items
    }

    return (
        <>
            <Stack
                direction='column'
            >
                <>{renderBreadCrumbs()}</>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
                    <TextField
                        disabled={!Boolean(focusedTodo)}
                        variant='standard'
                        inputProps={{
                            maxLength: Max_Todo_Title
                        }}
                        ref={titleRef}
                        placeholder='Title'
                        value={title}
                        maxRows={1}
                        onChange={
                            (event) => {
                                const newTitle = event.target.value;
                                setTitle(newTitle);

                                // 既存のタイマーをクリア
                                if (titleDebounceTimerRef.current) {
                                    clearTimeout(titleDebounceTimerRef.current);
                                }

                                // 新しいタイマーを設定
                                titleDebounceTimerRef.current = setTimeout(() => {
                                    setTodoParameter(focusedTodo.id, { title: newTitle });
                                }, TITLE_DEBOUNCE_MS);
                            }
                        }
                        onKeyDown={(e) => {
                            if (e.ctrlKey) {
                                if (e.key === "Enter") {
                                    addChildProcess();
                                }
                            } else if (e.shiftKey) {
                                if (e.key === "Enter") addBrotherProcess();
                            }
                        }}
                    ></TextField>
                    <Stack direction={"row"} justifyContent={"end"}>
                        {renderAddButtons()}
                        {renderSetRunningTodoButton()}
                        {renderMenuButton()}
                    </Stack>
                </Stack>
                <Box marginBottom={0.5} marginLeft={0.5} sx={{ color: "#00000099", fontSize: TodoStatus_FontSize }}>
                    {renderNotUntil()}
                    {renderTotal()}
                </Box>
                {isMobile ? (
                    <>
                        <Typography
                            sx={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '5px',
                                padding: '8px',
                                minHeight: '40px',
                                cursor: 'pointer',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: focusedTodo.memo ? 'inherit' : '#999',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                            onClick={() => setMemoModalOpen(true)}
                        >
                            {focusedTodo.memo || tll.t("Memo")}
                        </Typography>
                        <Dialog
                            fullScreen
                            open={memoModalOpen}
                            onClose={() => setMemoModalOpen(false)}
                        >
                            <DialogTitle>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <span>{tll.t("Memo")}</span>
                                    <Button onClick={() => setMemoModalOpen(false)}>
                                        {tll.t("Close")}
                                    </Button>
                                </Stack>
                            </DialogTitle>
                            <DialogContent>
                                <MemoTextArea
                                    disabled={!Boolean(focusedTodo)}
                                    todo_id={focusedTodo.id}
                                    text={focusedTodo.memo}
                                    onChanged={
                                        (newText: string) => {
                                            setTodoParameter(focusedTodo.id, { memo: newText })
                                        }
                                    }
                                />
                            </DialogContent>
                        </Dialog>
                    </>
                ) : (
                    <MemoTextArea
                        disabled={!Boolean(focusedTodo)}
                        todo_id={focusedTodo.id}
                        text={focusedTodo.memo}
                        onChanged={
                            (newText: string) => {
                                setTodoParameter(focusedTodo.id, { memo: newText })
                            }
                        }
                    />
                )}
                <TagsInputField
                    tags={tags}
                    enable={Boolean(focusedTodo)}
                    handleDelete={(name: string) => {
                        if (focusedTodo) {
                            setTodoParameter(focusedTodo.id, { tags: focusedTodo.tags.filter((t) => t !== name) })
                        }
                    }}
                    onChange={(text: string) => {
                        if (text === "" || text.length > Max_TagName_Length) return "";
                        if (focusedTodo) {
                            if (!focusedTodo.tags.some(t => t === text)) {
                                setTodoParameter(focusedTodo.id, { tags: (focusedTodo.tags).concat([text]) })
                            }
                        }
                        return "";
                    }}
                ></TagsInputField>
                <Stack direction="row" justifyContent={"end"}>
                    {renderMoveButton()}
                    {renderRemoveOrComeBackButton()}
                    {renderDeleteButton()}
                </Stack>
                <Button
                    color='primary'
                    onClick={() => {
                        setSettingVisible(!settingVisible);
                    }}><MenuIcon></MenuIcon></Button>
                <Collapse in={settingVisible}>
                    <Stack direction={"column"}>
                        <TextField
                            disabled={!Boolean(focusedTodo)}
                            label={tll.t("RunTime")}
                            variant={"standard"}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: Max_Runtime_Length
                            }}
                            value={Math.floor(runTime / 60)}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                if (focusedTodo) {
                                    const runT = event.target.value === '' ? 0 : Number.parseInt(event.target.value);
                                    setTodoParameter(focusedTodo.id, { runTime: runT * 60 })
                                }
                            }}
                        />
                        <>{renderIntervalOrDefaultIntervalField("defaultInterval")}</>
                        <TextField
                            disabled={!Boolean(focusedTodo)}
                            label={renderWeightLabel()}
                            variant={"standard"}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: Max_Weight_Length
                            }}
                            value={weight}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                if (focusedTodo) {
                                    const w = event.target.value === '' ? 0 : Number.parseInt(event.target.value);
                                    setTodoParameter(focusedTodo.id, { weight: w })
                                }
                            }}
                        />
                        <>{renderTodoPie()}</>
                        <>{renderPieSwitch()}</>
                    </Stack>
                </Collapse>
            </Stack>
            <Popover
                open={Boolean(moveToMenuAnchorEl)}
                onClose={() => { setMoveToMenuAnchorEl(null) }}
                anchorEl={moveToMenuAnchorEl}
            >
                <Stack>
                    <Typography minWidth={200} textAlign={"center"}>{tll.t("MoveTo")}</Typography>
                    <Autocomplete
                        options={movetoOptions}
                        getOptionLabel={(option: Todo | string) => {
                            return typeof option === "string" ? option : getAncestors(option, todos)
                                .sort((a, b) => - getLevel(a, todos) + getLevel(b, todos))
                                .map(t => t.displayTitle).join("/")
                        }}
                        isOptionEqualToValue={(option: Todo | string, value: Todo | string) => {
                            if (typeof (option) !== "string" && typeof (value) !== "string") {
                                return option.id === value.id;
                            } else if (typeof (option) === "string" && typeof (value) === "string") {
                                return option === value;
                            }
                            return false
                        }}
                        onInputChange={(event, value) => {
                            const options = getTodoOptions(todos, value)
                            setMoveToOptions(options)
                        }}
                        onChange={(event, newValue) => {
                            if (focusedTodo && newValue) {
                                if (typeof newValue === "string") {
                                    setPCRelation(undefined, focusedTodo)
                                } else {
                                    if (newValue.id === focusedTodo.id) return;
                                    const parent = todos.get(newValue.id)
                                    setPCRelation(parent, focusedTodo)
                                }
                                setMoveToMenuAnchorEl(null);
                            }
                        }}
                        renderInput={(params) => <TextField inputRef={moveToFormRef} {...params} />}
                    />
                </Stack>
            </Popover>
        </>
    );
}
export default TodoPane;