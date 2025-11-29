/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, Button, Card, Dialog, DialogContent, DialogTitle, Drawer, IconButton, MenuItem, Paper, Select, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import { getAncestors, getParent, getPrev, getTodosArray, Todo, getLevel, getTodoOptions, countTodos } from './datas/Todo';
import { getWindowDimensions, withoutDuplicate, intervalToString, downloadString, getYYYYMMDD } from './util';
import { Archive, Casino, ChevronLeft, ChevronRight, Create, Delete, Favorite, FileDownload, FileUpload, FormatListBulleted, Restore, Settings } from '@mui/icons-material';
import { Languages, languages, lang2TranslateLanguage } from './types/Languages';
import TodoPane from './components/TodoPane';
import { Document_Title, Font_Size, Card_PaddingX, Card_PaddingY, timerIntervalSliderMarks_day, timerIntervalSliderMarks_min, Tablet_BreakPoint, Mobile_BreakPoint, Drawer_Width, AboveAppContentArea_MinHeight } from './types/constants';
import ArchivePane from './components/ArchivePane';
import { TLLContext } from './App';
import KeyBoardShortCutHelp from './components/KeyBoardShortCutHelp';
import { addBrotherSCK, addChildSCK, changeFCompleteSCK, shortCutKeyToFunc, showKeyBoardShortCutKeyHelpSCK, showSearchTodoDialogSCK, useShortCutKeys } from './hooks/useShortCutKeys';
import { SearchTodoDialog } from './components/SearchTodoDialog';
import DateTimeNow from './components/DateTimeNow';
import { DrawerHeader, Main, addTodoToInboxButton_ID, calcAppContentLayout, done_, rollDice_ } from './AppCore_';
import { TimerSettingsDialog } from './components/TimerSettingsDialog';
import { TimerPane } from './components/TimerPane';
import { HomePane } from './components/HomePane';
import { AppHeadBar } from './components/AppHeadBar';
import { TodoTreeView } from './components/TodoTreeView';
import { TimerState } from './datas/TimerState';
import { todoWeightCalculator_view, useDiceTodoStates } from './contexts/DiceTodoContext';
import { useIsMobileLayout, useIsPCLayout, useIsTabletLayout } from './hooks/useLayout';

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
        loadDataFromText,
        deleteTodo, addTodo, restoreFromArchiveTodo, archiveTodo,
        stringifyAppData, setPCRelation,
    } = useDiceTodoStates()
    const focusedTodoID = focusedTodo ? focusedTodo.id : "";
    const thisRef = React.useRef<HTMLDivElement>(null);
    // モバイルデバイスではSidebarを初期状態で非表示にする
    const [drawerOpen_notMobile, setDrawerOpen] = React.useState(() => {
        const { width } = getWindowDimensions();
        return width > Tablet_BreakPoint;
    });
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
    const [mainAppPaneMobile, setMainAppPaneMobile] = useState<"timer" | "tree" | "todo">("timer") //timer, tree, todo
    const isPCLayout = useIsPCLayout();
    const isMobileLayout = useIsMobileLayout();
    const drawerOpen = drawerOpen_notMobile && !isMobileLayout;
    const appContentLayoutParams = calcAppContentLayout(windowSize, drawerOpen);

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
        shortCutKeyToFunc.set(addChildSCK, async () => {
            addChildOfFocusedTodo();
        })
        shortCutKeyToFunc.set(addBrotherSCK, async () => {
            addBrotherOfFocusedTodo();
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
            !runningTodo ? Document_Title :
                document.title
    }, [runningTodo])
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
        if (isDiceRolling) return;
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
                    linkClicked={(todo: Todo) => {
                        setFocusedTodo(todo);
                        expandTreeView(todo.id, true, true);
                    }}
                    titleRef={focusedTodoTitleRef}
                    focusedOrRunning='focused'
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

        const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const text = await file.text();
            loadDataFromText(text);  // ← 元の処理そのまま
        };

        return (
            <Dialog onClose={handleFileImportDialogClose} open={fileImportDialogOpen}>
                <DialogContent dividers>
                    <Stack direction="column" spacing={2} sx={{ width: 400, height: 500 }}>

                        <Button variant="contained" component="label">
                            ファイルを選択
                            <input
                                type="file"
                                accept="application/json"
                                hidden
                                onChange={handleChange}
                            />
                        </Button>

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
                setMainAppPaneMobile("todo");
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
    const timerIntervalSliderMarks = sliderIntervalUnit === "Min" ? timerIntervalSliderMarks_min : timerIntervalSliderMarks_day
    const timerPane = (
        <TimerPane
            timerIntervalSliderMarks={timerIntervalSliderMarks}
            sliderInterval={sliderInterval}
            sliderIntervalUnit={sliderIntervalUnit}
            sliderIntervalCoeff={sliderIntervalCoeff}
            setSliderInterval={setSliderInterval}
            setSliderIntervalUnit={setSliderIntervalUnit}
            setRunningTodo_withProc={setRunningTodo_withProc}
            rProbs={rProbs}
            rollDice={rollDice}
            expandTreeView={expandTreeView}
            done={done}
            sliderRunTime={sliderRunTime}
            setSliderRunTime={setSliderRunTime}
            sliderIntervalMax={sliderIntervalMax}
            tags={tags}
            settingsButton={settingsButton}
            intervalString={intervalString}
            isDiceRolling={isDiceRolling}
            onTitleClicked={() => {
                setMainAppPaneMobile("todo");
            }}
        />

    )
    const todoPaneWidth = appContentLayoutParams.todoPaneWidth
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
    const todoPane_and_timerPane = () => {
        if (isPCLayout) {
            return <>{todoPane}{timerPane}</>
        } else {
            return <>{timerPane}{todoPane}</>
        }
    }
    const appHeaderBar = isMobileLayout ? <></> :
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
    const dateTimeNow = isMobileLayout ? <></> :
        <Stack direction={'row-reverse'} color="grey"><DateTimeNow /></Stack>
    const todoTreeView = <TodoTreeView
        todos={todos}
        expandedTodos={expandedTodos}
        expandTreeView={expandTreeView}
        userSettings={userSettings}
        calcWeight_view={calcWeight_view}
        focusedTodoID={focusedTodoID}
        setFocusedTodo={setFocusedTodo}
        collapseTreeView={collapseTreeView}
        onItemClicked={() => { setMainAppPaneMobile("todo") }}
    />
    const importButton = (
        <IconButton
            onClick={async (event) => {
                setFileImportDialogOpen(true);
            }}
            size="small"
            sx={{
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
                '&:active': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
            }}
        >
            <FileUpload sx={{ fontSize: 18 }} />
        </IconButton>
    )
    const exportButton = (
        <IconButton
            onClick={
                async (event) => {
                    const str = await stringifyAppData();
                    if (str) {
                        const yyyymmdd = getYYYYMMDD()
                        downloadString(str, "", "dt_" + yyyymmdd + ".json");
                    }
                }
            }
            size="small"
            sx={{
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
                '&:active': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
            }}
        >
            <FileDownload sx={{ fontSize: 18 }} />
        </IconButton>
    )
    const importExportButtons = (
        <Stack direction="row" gap={0.5}>
            {importButton}
            {exportButton}
        </Stack>
    )
    const todoCountsUI = (
        <Stack
            direction="column"
            justifyContent={"end"}
            sx={{
                position: isMobileLayout ? 'sticky' : 'static',
                bottom: isMobileLayout ? 0 : 'auto',
                backgroundColor: isMobileLayout ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                backdropFilter: isMobileLayout ? 'blur(8px)' : 'none',
                borderTop: isMobileLayout ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                padding: isMobileLayout ? '12px 16px' : 0,
                marginTop: isMobileLayout ? 'auto' : 0,
                zIndex: 10,
            }}
        >
            <Stack
                sx={{ minHeight: isMobileLayout ? 'auto' : AboveAppContentArea_MinHeight }}
                direction="row"
                justifyContent={isMobileLayout ? "space-between" : "end"}
                alignItems="center"
                gap={isMobileLayout ? 1 : 0}
            >
                {(
                    <Stack direction="row" justifyContent={"space-between"} alignItems="center" gap={1} flexGrow={1}>
                        <Typography sx={{ color: "grey", fontSize: 11, fontWeight: 500 }}>
                            Tasks {countTodos(todos)}
                        </Typography>
                        {importExportButtons}
                    </Stack>
                )}
            </Stack>
        </Stack>
    )
    const archiveButton = (
        <Button color='inherit' onClick={() => {
            setFocusedTodo(undefined);
            setIsArchiveFocused(true);
        }} startIcon={<Delete></Delete>}>
            {tll.t("Archive")}
        </Button>
    )
    const sideBarContent = (
        <Drawer
            sx={{
                width: Drawer_Width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: Drawer_Width,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="left"
            open={drawerOpen}
        >
            <DrawerHeader>
                <IconButton onClick={(event) => { setDrawerOpen(false) }}>
                    {drawerOpen ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
            </DrawerHeader>
            {todoTreeView}
            <Stack paddingLeft={"5%"} direction={"row"} justifyContent={"left"}>
                {archiveButton}
            </Stack>
            {todoCountsUI}
        </Drawer>
    )
    const searchTodoDialog = <SearchTodoDialog
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
    />
    const timerSettingDialog = <TimerSettingsDialog
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
    const treeViewPane_Mobile = <Paper>
        {todoTreeView}
        {todoCountsUI}
    </Paper>

    const keyboardShortCutHelp = <KeyBoardShortCutHelp
        open={keyboardShortCutHelpVisibility}
        onclose={() => { setKeyboardShortCutHelpVisibility(false) }}
        keyAndDescs={shortCutKeysAndHelps}
    ></KeyBoardShortCutHelp>

    const mainAppPaneMobileUI = !isMobileLayout ? <></> : (
        mainAppPaneMobile === "timer" ? timerPane :
            mainAppPaneMobile === "tree" ? treeViewPane_Mobile :
                todoPane
    )
    const mainApp = isMobileLayout ? mainAppPaneMobileUI : todoPane_and_timerPane()
    const buttonNavMobile = !isMobileLayout ? <></> : (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
                value={mainAppPaneMobile}
                onChange={(event, newValue) => {
                    console.log(newValue);
                    setMainAppPaneMobile(newValue);
                }}
            >
                <BottomNavigationAction value={"todo"} label="Todo" icon={<Create />} />
                <BottomNavigationAction value={"timer"} label="Timer" icon={<Casino />} />
                <BottomNavigationAction value={"tree"} label="Tree" icon={<FormatListBulleted />} />
            </BottomNavigation>
        </Paper>
    )

    //@@return
    return (
        <Box sx={{ display: 'flex', fontSize: Font_Size }} ref={thisRef}>
            {appHeaderBar}
            {sideBarContent}
            <Main
                open={drawerOpen} //サイドバーに押し込められるようになる。外すとサイドバーが上に被さる。
            >
                {dateTimeNow}
                <Stack
                    marginTop={isMobileLayout ? 0 : "10px"}
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 1, sm: 2, }}
                    justifyContent="space-around"
                >
                    {mainApp}
                    {buttonNavMobile}
                </Stack>
            </Main>
            {/* --------------------------------------------@modals -------------------------------------*/}
            {renderUserSettingsDialog()}
            {searchTodoDialog}
            {timerSettingDialog}
            {renderFileImportModal()}
            {/* --------------------------------------------@invisible components -------------------------------------*/}
            {keyboardShortCutHelp}
        </Box >
    );
}

const calcElapsedTime = (timerState: TimerState) => {
    if (timerState.timeAtStarted === null) return 0
    return (Date.now() - timerState.timeAtStarted) + timerState.elapsedTimeUntilLastPaused
}