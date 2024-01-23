/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { getAncestors, getParent, getPrev, getTodosArray, Todo, getLevel, getTodoOptions } from './datas/Todo';
import { getWindowDimensions, withoutDuplicate, intervalToString } from './util';
import { Settings } from '@mui/icons-material';
import { Languages, languages, lang2TranslateLanguage } from './types/Languages';
import TodoPane from './components/TodoPane';
import { Document_Title, DocumentTitle_WhileSync, Font_Size, Card_PaddingX, Card_PaddingY, timerIntervalSliderMarks_day, timerIntervalSliderMarks_min } from './types/constants';
import ArchivePane from './components/ArchivePane';
import { TLLContext } from './App';
import KeyBoardShortCutHelp from './components/KeyBoardShortCutHelp';
import { todoWeightCalculator_view, useDiceTodoStates } from './hooks/useDiceTodoStates';
import { addBrotherSCK, addChildSCK, addTodoInboxSCK, changeFCompleteSCK, changeRCompleteSCK, rollDiceSCK, shortCutKeyToFunc, showKeyBoardShortCutKeyHelpSCK, showSearchTodoDialogSCK, useShortCutKeys } from './hooks/useShortCutKeys';
import { FileUploader } from 'react-drag-drop-files';
import { updateTodo } from './db';
import { SearchTodoDialog } from './components/SearchTodoDialog';
import DateTimeNow from './components/DateTimeNow';
import { Main, addTodoToInboxButton_ID, calcAppContentLayout, done_, isRecording, rollDice_, setIsRecording } from './AppCore_';
import { TimerSettingsDialog } from './components/TimerSettingsDialog';
import { TimerPane } from './components/TimerPane';
import { HomePane } from './components/HomePane';
import { AppHeadBar } from './components/AppHeadBar';
import { TodoTreeView } from './components/TodoTreeView';

export const AppCore = () => {
    //@@usestate
    const {
        todos, setTodoParameter, updateTodos,
        focusedTodo, setFocusedTodo,
        runningTodo, setRunningTodo: setRunningTodo_core,
        records, setRecords,
        userSettings, setUserSettings,
        todoFutures, setTodoFutures,
        userInfo,
        timerState, setTimerState,
        isSynchronizing, loadDataFromText,
        deleteTodo, addTodo, restoreFromArchiveTodo, archiveTodo,
        stringifyAppData, setPCRelation,
    } = useDiceTodoStates()
    const focusedTodoID = focusedTodo ? focusedTodo.id : "";
    const thisRef = React.useRef<HTMLDivElement>(null);
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const [addMenuAnchorEl, setAddMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [addTodoHelpOpen, setAddTodoHelpOpen] = React.useState(false);
    const focusedTodoTitleRef = React.useRef<HTMLDivElement>(null);
    const [addTodoInboxButtonRef, setAddTodoInboxButtonRef] = React.useState<null | HTMLElement>(null);
    const [expandedTodos, setExpandedTodos] = useState<string[]>([]);
    const [willTreeViewScroll, setWillTreeViewScroll] = useState(false);
    const [userSettingsDialogOpen, setUserSettingsDialogOpen] = useState(false);
    const [searchTodoDialogOpen, setSearchTodoDialogOpen] = useState(false);
    const searchTodoDialogInputRef = React.useRef<HTMLDivElement>(null);
    const [timerSettingsDialogOpen, setTimerSettingsDialogOpen] = useState(false);
    const [fileImportDialogOpen, setFileImportDialogOpen] = useState(false);
    const [isDiceRolling, setIsDiceRolling] = useState(false);
    const [rProbs, setRprobs] = useState<number[]>([]);
    const [isArchiveFocused, setIsArchiveFocused] = useState(false);
    const [keyboardShortCutHelpVisibility, setKeyboardShortCutHelpVisibility] = useState(false);
    const [willExpandTreeLateId, setWillExpandTreeLateId] = useState<string | null>(null);
    const [sliderRunTime, setSliderRunTime] = useState(0);
    const [sliderInterval, setSliderInterval] = useState(-1);
    const [sliderIntervalUnit, setSliderIntervalUnit] = useState<"Min" | "Day">("Min")
    const sliderIntervalMax = sliderIntervalUnit === "Min" ? 1440 : 365
    const sliderIntervalCoeff = sliderIntervalUnit === "Min" ? 60 : 86400
    const tll = useContext(TLLContext);

    const [windowSize, setWindowSize] = useState(getWindowDimensions());
    const { shortCutKeysAndHelps } = useShortCutKeys(tll)

    const setRunningTodo_withProc = (todo: Todo | undefined, initSlider: boolean = true, initTimer: boolean = true) => {
        setRunningTodo_core(todo)
        if (initSlider) {
            setSliderInterval(-1)
            setSliderRunTime(-1)
            setSliderIntervalUnit("Min")
        }
        if (initTimer) {
            if (todo) {
                setTimerState(
                    {
                        ...timerState,
                        timeAtStarted: timerState.timeAtStarted === null ?
                            Date.now() :
                            timerState.timeAtStarted,
                        remainTime: todo.runTime
                    }
                )
            }
        }
    }
    //初期化
    useEffect(function initApp() {
        (async () => {
            if (userInfo && userInfo.hasCreatedDefaultTodos === false) {
                setAddTodoHelpOpen(true)
            }
        })()

        function setAnchorEL() {
            const id = document.getElementById(addTodoToInboxButton_ID)
            if (id === null) {
                setTimeout(() => {
                    setAnchorEL()
                }, 1000);
            } else {
                setAddTodoInboxButtonRef(id)
            }
        }
        setAnchorEL()

        const onResize = () => {
            setWindowSize(getWindowDimensions());
        }
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, []);
    useEffect(() => {
        if (focusedTodo) setIsArchiveFocused(false)
    }, [focusedTodo])
    useEffect(function updateTLLLang() {
        if (!userSettings) return
        tll.lang = lang2TranslateLanguage(userSettings.language);
    }, [userSettings])
    //useHotKeysで直接実行するとtodosなどが空なので苦肉の策
    useEffect(function setShortCutKey() {
        shortCutKeyToFunc.set(rollDiceSCK, async () => { rollDice() })
        shortCutKeyToFunc.set(addChildSCK, async () => {
            addChildOfFocusedTodo();
        })
        shortCutKeyToFunc.set(addBrotherSCK, async () => {
            addBrotherOfFocusedTodo();
        })
        shortCutKeyToFunc.set(addTodoInboxSCK, async () => {
            addTodoToInbox();
        })
        shortCutKeyToFunc.set(changeRCompleteSCK, async () => {
            if (runningTodo) {
                setTodoParameter(runningTodo.id, { isCompleted: !runningTodo.isCompleted })
            }
        })
        shortCutKeyToFunc.set(changeFCompleteSCK, async () => {
            if (focusedTodo) {
                setTodoParameter(focusedTodo.id, { isCompleted: !focusedTodo.isCompleted })
            }
        })
        shortCutKeyToFunc.set(showKeyBoardShortCutKeyHelpSCK, async () => {
            setKeyboardShortCutHelpVisibility(!keyboardShortCutHelpVisibility);
        })
        shortCutKeyToFunc.set(showSearchTodoDialogSCK, async () => {
            setSearchTodoDialogOpen(!searchTodoDialogOpen);
            setTimeout(() => {
                if (searchTodoDialogInputRef.current) {
                    searchTodoDialogInputRef.current.focus()
                }
            }, 200)
        })
    }, [todos, records, userInfo, userSettings, keyboardShortCutHelpVisibility])
    // ブラウザタグの文字列を変更する処理
    useEffect(function updateTitle() {
        document.title =
            isSynchronizing ? DocumentTitle_WhileSync :
                !runningTodo ? Document_Title :
                    document.title
    }, [isSynchronizing, runningTodo])
    useEffect(() => {
        if (willExpandTreeLateId) {
            expandTreeView(willExpandTreeLateId, true, true);
            setWillExpandTreeLateId(null);
        }
    }, [willExpandTreeLateId])
    useEffect(() => {
        if (!willTreeViewScroll) return
        setTimeout(() => {//expandをまつ
            if (focusedTodo) {
                const todoItemclassName = 'treeItem-' + focusedTodo.id
                const elements = document.getElementsByClassName(todoItemclassName)
                if (elements.length > 0) {
                    elements[0].scrollIntoView({ behavior: 'smooth', block: "center" })
                }
            }
            setWillTreeViewScroll(false)
        }, 500)
    }, [willTreeViewScroll])
    useEffect(() => {
        if (!isRecording) return
        setIsRecording(false)
    }, [records])
    if (!userSettings || !userInfo) return <></>
    const tags: string[] = withoutDuplicate(getTodosArray(todos).flatMap(todo => todo.tags))
    //--------------------------@@processes-------------------------------------
    const calcWeight_view = (todo: Todo) => todoWeightCalculator_view.calcWeight(todo, todos, records, userSettings, new Date())
    /*forceExpand:if:
        false:すでに開いてるときは閉じる。
        true:常に開く。
    */
    const expandTreeView = (targetID: string, scroll: boolean, forceExpand: boolean) => {
        const target = todos.get(targetID);
        if (target) {
            if (expandedTodos.some(i => i === target.id) && !forceExpand) {    //ターゲットがもうすでに開かれているとき
                setExpandedTodos(expandedTodos.filter(i => i !== target.id))
            } else {
                const ancestorsIDs = getAncestors(target, todos).map(t => t.id);
                setExpandedTodos(withoutDuplicate(expandedTodos.concat(ancestorsIDs)));
            }
        }
        if (scroll) {
            setWillTreeViewScroll(true)
        }
    }
    const collapseTreeView = (targetID: string) => {
        const target = todos.get(targetID);
        if (target) setExpandedTodos(expandedTodos.filter(i => i !== target.id))
    }
    const addNewTodoAndFocus = (todo?: Todo) => {
        const newTodo = addTodo({ title: "", parentId: undefined });
        setFocusedTodo(newTodo);
        focusOnTitleLate();
    }
    const addTodoToInbox = () => {
        const inboxs = (getTodosArray(todos).filter(t => t.isInbox))
        if (inboxs.length === 0) {
            addNewTodoAndFocus();
        } else if (inboxs.length === 1) {
            const inbox = inboxs[0];
            addNewTodoAndFocus(inbox);
        } else {
            setAddMenuAnchorEl(addTodoInboxButtonRef);
        }
    }
    //同期的に行うとフォーカスされないので苦肉の策
    const focusOnTitleLate = () => {
        setTimeout(() => {
            focusedTodoTitleRef.current?.focus();
        }, 150)
    }
    const addBrotherOfFocusedTodo = () => {
        if (focusedTodo === undefined) return;

        const parent = getParent(focusedTodo, todos);
        const newTodo = addTodo({ title: "", parentId: parent?.id });
        setFocusedTodo(newTodo);
        setWillExpandTreeLateId(newTodo.id);
        focusOnTitleLate();
    }
    const addChildOfFocusedTodo = () => {
        if (focusedTodo === undefined) return;

        const newTodo = addTodo({ title: "", parentId: focusedTodo.id });
        setFocusedTodo(newTodo);
        setWillExpandTreeLateId(newTodo.id);
        focusOnTitleLate();
    }
    const rollDice = (parent?: Todo) => {
        rollDice_(
            isDiceRolling,
            todos, records, userSettings, timerState,
            setIsDiceRolling, setRprobs, setTimerState, setRunningTodo_withProc, setAddTodoHelpOpen,
            parent)
    }
    function appendTodo(t: Todo, probs: number[] = []) {
        const todoFutures_new = [...todoFutures]
        todoFutures_new.push({ idOfTodo: t.id, probs: probs, elapsedTime: 0 })
        setTodoFutures(todoFutures_new)
    }
    function interruptTodo(t: Todo, probs: number[] = []) {
        setRprobs(probs);
        setRunningTodo_withProc(t, true, false);
        if (runningTodo) {
            const todoFutures_new = [...todoFutures]
            const elapsedTime = (timerState.timeAtStarted ? Date.now() - timerState.timeAtStarted : 0) + timerState.elapsedTimeUntilLastPaused
            todoFutures_new.unshift({ idOfTodo: runningTodo.id, probs: [], elapsedTime })
            setTodoFutures(todoFutures_new)
            setTimerState({ elapsedTimeUntilLastPaused: 0, timeAtStarted: Date.now(), remainTime: t.runTime })
        }
    }
    function done(elapsedTime: number) {
        setIsRecording(true)
        done_(
            elapsedTime,
            runningTodo, sliderInterval, sliderIntervalCoeff, todos,
            setRunningTodo_withProc, setTimerState, updateTodos, setRecords)
    }

    //--------------------------------@@render-----------------------------------
    const renderTodoPane = () => {
        return (
            !focusedTodo ?
                <HomePane /> :
                <TodoPane
                    userSettings={userSettings}
                    todo={focusedTodo}
                    todos={todos}
                    records={records}
                    linkClicked={(todo: Todo) => {
                        setFocusedTodo(todo);
                        expandTreeView(todo.id, true, true);
                    }}
                    titleRef={focusedTodoTitleRef}
                    onBeforeUnloadMemo={(value: { id: string, text: string }) => {
                        updateTodo(value.id, { memo: value.text })
                    }}
                    focusedOrRunning='focused'
                    setTodoParameter={setTodoParameter}
                    addBrotherProcess={addBrotherOfFocusedTodo}
                    addChildProcess={addChildOfFocusedTodo}
                    moveToArchiveButtonClicked={() => {
                        if (focusedTodo === undefined) return;

                        const prev = getPrev(focusedTodo, todos, (todo: Todo) => { return !todo.isArchived });
                        setFocusedTodo(prev);

                        archiveTodo(focusedTodo);
                        if (runningTodo && runningTodo.id === focusedTodo.id) {
                            setRunningTodo_withProc(undefined);
                        }
                    }}
                    restoreFromTrashButtonClicked={() => {
                        if (focusedTodo === undefined) return;

                        setFocusedTodo(focusedTodo);
                        restoreFromArchiveTodo(focusedTodo);
                        if (runningTodo && runningTodo.id === focusedTodo.id) {
                            setRunningTodo_withProc(undefined);
                        }
                    }}
                    deleteButtonClicked={() => {
                        if (focusedTodo === undefined) return;

                        setFocusedTodo(undefined);
                        deleteTodo(focusedTodo);
                        if (runningTodo && runningTodo.id === focusedTodo.id) {
                            setRunningTodo_withProc(undefined);
                        }
                    }}
                    setFocused2RunningButtonClicked={() => {
                        if (focusedTodo === undefined) return;

                        setRprobs([]);
                        setRunningTodo_withProc(focusedTodo);
                    }}
                    setPCRelation={setPCRelation}
                    calcWeight={calcWeight_view}
                    interruptTodoFutureClicked={() => {
                        if (focusedTodo) interruptTodo(focusedTodo)
                    }}
                    appendTodoFutureClicked={() => {
                        if (focusedTodo === undefined) return;
                        appendTodo(focusedTodo)
                    }}
                    pickFromSubClicked={() => {
                        rollDice(focusedTodo)
                    }}
                />
        )
    }

    const handleUserSettingsDialogClose = () => {
        setUserSettingsDialogOpen(false);
    }
    const renderUserSettingsDialog = () => {
        const nameUI =
            <Stack direction="row" spacing={8}>
                <Typography >{tll.t("Name")}</Typography>
                <TextField variant='standard' value={userSettings.name} inputProps={{ maxLength: 20 }} onChange={(event) => {
                    const str = event.target.value;
                    userSettings.name = str;
                    setUserSettings({ ...userSettings, name: str });
                }}></TextField>
            </Stack>
        const languageUI =
            <Stack direction="row" spacing={8}>
                <Typography >{tll.t("Language")}</Typography>
                <Select variant='standard' value={userSettings.language} onChange={(event) => {
                    setUserSettings({ ...userSettings, language: event.target.value as Languages });
                }}>
                    {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
            </Stack>

        return (
            <Dialog onClose={handleUserSettingsDialogClose} open={userSettingsDialogOpen}>
                <DialogTitle >{tll.t("ProfileAndSettings")}</DialogTitle>
                <DialogContent dividers>
                    <Stack direction="column" spacing={2}>
                        {
                            <Typography fontWeight={700} >{tll.t("Account")}</Typography>
                        }
                        {nameUI}
                        <Typography fontWeight={700} >{tll.t("Settings")}</Typography>
                        {languageUI}
                        <Typography fontWeight={700} >{tll.t("Others")}</Typography>

                    </Stack>
                </DialogContent>
            </Dialog>
        )
    }
    const handleTimerSettingsDialogClose = () => {
        setTimerSettingsDialogOpen(false);
    }
    const handleFileImportDialogClose = () => {
        setFileImportDialogOpen(false);
    }
    const renderFileImportModal = () => {
        const fileTypes = ["json"];
        const handleChange = async (file: File) => {
            const text = await file.text()
            loadDataFromText(text);
        };
        return (
            <Dialog onClose={handleFileImportDialogClose} open={fileImportDialogOpen} >
                <DialogContent dividers>
                    <Stack direction="column" spacing={2} sx={{ width: 400, height: 500 }}>
                        <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
                    </Stack>
                </DialogContent>
            </Dialog>
        );
    }
    const archivePane =
        <ArchivePane
            todos={todos}
            onTodoTitleClicked={(todo: Todo) => {
                setFocusedTodo(todo);

            }}
            onArchiveButtonClicked={(todo: Todo) => {
                archiveTodo(todo);
            }}
            onDeleteButtonClicked={function (todo: Todo): void {
                deleteTodo(todo);
            }}
            onRestoreButtonClicked={function (todo: Todo): void {
                restoreFromArchiveTodo(todo);
                setTodoParameter(todo.id, { isCompleted: true })
            }}
            onDeleteAllTodosInArchiveClicked={() => {
                getTodosArray(todos).filter(t => t.isArchived).forEach((t) => {
                    deleteTodo(t);
                });
            }}
        ></ArchivePane>
    const intervalString =
        !runningTodo ?
            "" :
            sliderInterval >= 0 ?
                intervalToString(sliderInterval * sliderIntervalCoeff) :
                runningTodo.defaultInterval !== 0 ?
                    intervalToString(runningTodo.defaultInterval) :
                    ""


    const settingsButton = (
        <Button onClick={() => {
            setTimerSettingsDialogOpen(true);
        }} style={{ color: "grey" }}>
            <Settings></Settings>
        </Button>
    )
    const switchOrderUIWithWindowWidth = () => {
        const appContentLayoutParams = calcAppContentLayout(windowSize, drawerOpen);
        const isPCWidth = appContentLayoutParams.isPCLayout
        const todoPaneWidth = appContentLayoutParams.todoPaneWidth
        const timerPaneWidth = appContentLayoutParams.timerPaneWidth
        const timerIntervalSliderMarks = sliderIntervalUnit === "Min" ? timerIntervalSliderMarks_min : timerIntervalSliderMarks_day
        const todoPane = (
            <Card key="dt-todo-pane" variant="elevation" elevation={0}
                sx={{
                    paddingX: Card_PaddingX, paddingTop: Card_PaddingY * 2, paddingBottom: Card_PaddingY * 4,
                    borderWidth: 0.5,
                    borderColor: "#BBB",
                }}>
                <Stack direction={"row"} justifyContent="center">
                    <Box width={todoPaneWidth}>{isArchiveFocused ? archivePane : renderTodoPane()}</Box>
                </Stack>
            </Card>)
        const timerUI = (
            <TimerPane
                runningTodo={runningTodo}
                timerState={timerState}
                timerIntervalSliderMarks={timerIntervalSliderMarks}
                sliderInterval={sliderInterval}
                sliderIntervalUnit={sliderIntervalUnit}
                sliderIntervalCoeff={sliderIntervalCoeff}
                setSliderInterval={setSliderInterval}
                setSliderIntervalUnit={setSliderIntervalUnit}
                setTimerState={setTimerState}
                setRunningTodo_withProc={setRunningTodo_withProc}
                setTodoParameter={setTodoParameter}
                rProbs={rProbs}
                userSettings={userSettings}
                rollDice={rollDice}
                setFocusedTodo={setFocusedTodo}
                expandTreeView={expandTreeView}
                done={done}
                sliderRunTime={sliderRunTime}
                setSliderRunTime={setSliderRunTime}
                sliderIntervalMax={sliderIntervalMax}
                todos={todos}
                records={records}
                setRecords={setRecords}
                todoFutures={todoFutures}
                setTodoFutures={setTodoFutures}
                tags={tags}
                setUserSettings={setUserSettings}
                settingsButton={settingsButton}
                isSynchronizing={isSynchronizing}
                intervalString={intervalString}
                timerPaneWidth={timerPaneWidth}
                isDiceRolling={isDiceRolling}
                rollDiceDisabled={isRecording}
            />

        )
        if (isPCWidth) {
            return <>{todoPane}{timerUI}</>
        } else {
            return <>{timerUI}{todoPane}</>
        }
    }

    //@@return
    return (
        <Box sx={{ display: 'flex', fontSize: Font_Size }} ref={thisRef}>
            <AppHeadBar
                todos={todos}
                setRprobs={setRprobs}
                setRunningTodo_withProc={setRunningTodo_withProc}
                setFocusedTodo={setFocusedTodo}
                setWillExpandTreeLateId={setWillExpandTreeLateId}
                interruptTodo={interruptTodo}
                appendTodo={appendTodo}
                setAddMenuAnchorEl={setAddMenuAnchorEl}
                addMenuAnchorEl={addMenuAnchorEl}
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                addTodoToInbox={addTodoToInbox}
                addTodoHelpOpen={addTodoHelpOpen}
                setAddTodoHelpOpen={setAddTodoHelpOpen}
                setKeyboardShortCutHelpVisibility={setKeyboardShortCutHelpVisibility}
                focusOnTitleLate={focusOnTitleLate}
                addTodo={addTodo}
            />
            <TodoTreeView
                todos={todos}
                expandedTodos={expandedTodos}
                expandTreeView={expandTreeView}
                userSettings={userSettings}
                calcWeight_view={calcWeight_view}
                focusedTodoID={focusedTodoID}
                setFocusedTodo={setFocusedTodo}
                setIsArchiveFocused={setIsArchiveFocused}
                setDrawerOpen={setDrawerOpen}
                drawerOpen={drawerOpen}
                collapseTreeView={collapseTreeView}
                stringifyAppData={stringifyAppData}
                setFileImportDialogOpen={setFileImportDialogOpen}
            />
            <Main open={drawerOpen} >
                <Stack direction={'row-reverse'} marginTop={
                    (() => {
                        const appbar = document.getElementById("RPApp-AppBar")
                        if (appbar) {
                            return appbar.clientHeight / 2 + "px"
                        }
                        return "48px"
                    })()
                } paddingTop={"2px"} color="grey"><DateTimeNow /></Stack>
                <Stack
                    marginTop={"10px"}
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 1, sm: 2, }}
                    justifyContent="space-around"
                >
                    {switchOrderUIWithWindowWidth()}
                </Stack>
            </Main>
            {/* --------------------------------------------@modals -------------------------------------*/}
            {renderUserSettingsDialog()}
            {<SearchTodoDialog
                getOptionLabel={(option: Todo | string) => {
                    return typeof option === "string" ? option : getAncestors(option, todos)
                        .sort((a, b) => - getLevel(a, todos) + getLevel(b, todos))
                        .map(t => t.displayTitle).join("/")
                }}
                getOptions={(value) => {
                    return getTodoOptions(todos, value)
                }}
                onSelect={(newValue, shiftEnter) => {
                    const set = shiftEnter ?
                        setRunningTodo_withProc :
                        (todo: Todo | undefined) => {
                            setFocusedTodo(todo)
                            if (todo) {
                                expandTreeView(todo.id, true, true);
                            }
                        }
                    if (newValue) {
                        if (typeof newValue === "string") {
                            set(undefined)
                        } else {
                            set(newValue)
                        }
                    }
                    setSearchTodoDialogOpen(false)
                }}
                onclose={() => {
                    setSearchTodoDialogOpen(false)
                }}
                ref={searchTodoDialogInputRef}
                open={searchTodoDialogOpen}
                label={tll.t("EnterShiftEnterAtSearchTodoDialog")}
            />}
            <TimerSettingsDialog
                userSettings={userSettings}
                setUserSettings={setUserSettings}
                timerSettingsDialogOpen={timerSettingsDialogOpen}
                handleTimerSettingsDialogClose={
                    handleTimerSettingsDialogClose
                }
                onCustomWeightEditorButtonClick={(value: string) => {
                    try {
                        // eslint-disable-next-line no-new-func
                        const func = new Function('todos', 'records', 'date', value)
                        const a = func((todos.values()), records, new Date())
                        console.log(a)
                    } catch (error) {
                        console.log(error)
                    }
                }}
            />
            {renderFileImportModal()}
            {/* --------------------------------------------@invisible components -------------------------------------*/}
            <KeyBoardShortCutHelp
                open={keyboardShortCutHelpVisibility}
                onclose={() => { setKeyboardShortCutHelpVisibility(false) }}
                keyAndDescs={shortCutKeysAndHelps}
            ></KeyBoardShortCutHelp>
        </Box >
    );
}