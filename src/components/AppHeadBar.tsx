import { Link, Tooltip, Stack, Button, Box, IconButton, Menu, Toolbar, styled, MenuItem } from "@mui/material";
import { Todo, getTodosArray } from "../datas/Todo";
import { mapToValueArray } from "../util";
import { useContext } from "react";
import { TLLContext } from "../App";
import { HelpOutline } from "@mui/icons-material";
import { addTodoToInboxButton_ID } from "../AppCore_";
import { Drawer_Width } from "../types/constants";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
export interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

export const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open', })<AppBarProps>(
    ({ theme, open }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
            width: `calc(100% - ${Drawer_Width}px)`,
            marginLeft: `${Drawer_Width}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
    }));

export function AppHeadBar(props: {
    todos: Map<string, Todo>,
    setRprobs: React.Dispatch<React.SetStateAction<number[]>>,
    setRunningTodo_withProc: (todo: Todo | undefined, isCompleted?: boolean, needDelete?: boolean) => void,
    setFocusedTodo: (todo: Todo | undefined) => void,
    setWillExpandTreeLateId: (id: string | null) => void,
    interruptTodo: (todo: Todo) => void,
    appendTodo: (todo: Todo) => void,
    setAddMenuAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>,
    addMenuAnchorEl: null | HTMLElement,
    drawerOpen: boolean,
    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>,
    addTodoToInbox: () => void,
    addTodoHelpOpen: boolean,
    setAddTodoHelpOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setKeyboardShortCutHelpVisibility: React.Dispatch<React.SetStateAction<boolean>>,
    focusOnTitleLate: () => void,
    addTodo: (todo: { title: string; parentId?: string | undefined; }) => Todo;
}) {
    const {
        todos,
        setRprobs,
        setRunningTodo_withProc,
        setFocusedTodo,
        setWillExpandTreeLateId,
        interruptTodo,
        appendTodo,
        setAddMenuAnchorEl,
        addMenuAnchorEl,
        drawerOpen,
        setDrawerOpen,
        addTodoToInbox,
        addTodoHelpOpen,
        setAddTodoHelpOpen,
        setKeyboardShortCutHelpVisibility,
        focusOnTitleLate,
        addTodo
    } = props
    const tll = useContext(TLLContext)
    const handleAddMenuClose = () => {
        setAddMenuAnchorEl(null);
    };
    const renderAddMenuItems = () => {
        const inboxs = (getTodosArray(todos).filter(t => t.isInbox))
        if (inboxs.length == 0 || inboxs.length == 1) return;

        const onClickProcess = (todo: Todo | undefined) => {
            const newTodo = addTodo({ title: "", parentId: todo?.id })
            setFocusedTodo(newTodo);
            focusOnTitleLate();
            handleAddMenuClose();
        }
        const menus = inboxs.map(t => {
            return (
                <MenuItem
                    key={t.id + "iAddMenu"}
                    onClick={() => {
                        onClickProcess(t)
                    }}>{t.displayTitle + " +"}
                </MenuItem>);
        })
        menus.unshift(
            <MenuItem
                key={"HomeIAddMenu"}
                onClick={() => {
                    onClickProcess(undefined);
                }}
            >Home +</MenuItem>)
        return menus;
    }
    const favoriteTodoLinks = mapToValueArray(todos).filter(t => t.isFavorite && !t.isArchived)
        .map(t => {
            return (
                <Tooltip
                    key={"fav-" + t.id}
                    title={
                        <Stack >
                            <Link
                                style={{ "color": "white" }}
                                component="button"
                                onClick={() => {
                                    setRprobs([]);
                                    setRunningTodo_withProc(t);
                                }}>
                                {tll.t("SetTaskToTimer")}
                            </Link>
                            <Link
                                style={{ "color": "white" }}
                                component="button"
                                onClick={() => {
                                    interruptTodo(t)
                                }}>
                                {tll.t("InterruptTodo")}
                            </Link>
                            <Link
                                style={{ "color": "white" }}
                                component="button"
                                onClick={() => {
                                    appendTodo(t)
                                }}>
                                {tll.t("AppendTodo")}
                            </Link>
                        </Stack>}>
                    <Button
                        color='inherit'
                        onClick={() => {
                            setFocusedTodo(t)
                            setWillExpandTreeLateId(t.id)
                        }}>{t.displayTitle}</Button>
                </Tooltip>
            )
        })
    return (
        <AppBar id="RPApp-AppBar" position="fixed" open={drawerOpen} elevation={0} variant="elevation" color={"inherit"} >
            <Toolbar variant='dense'>
                <IconButton
                    disableFocusRipple
                    aria-label="open drawer"
                    onClick={() => { setDrawerOpen(true) }}
                    sx={{ mr: 2, color: "grey", ...(drawerOpen && { display: 'none' }) }}
                >
                    <MenuIcon />
                </IconButton>
                <Box flexGrow={1} textAlign={"left"}>
                    <Stack direction={"row"}>
                        {favoriteTodoLinks}
                    </Stack>
                </Box>
                <Tooltip title={"click here to create todolist"} arrow open={addTodoHelpOpen} onClose={() => {
                    setAddTodoHelpOpen(false)
                }}>
                    <IconButton
                        disableFocusRipple
                        disableRipple
                        id={addTodoToInboxButton_ID}
                        onClick={(event) => {
                            addTodoToInbox();
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={addMenuAnchorEl}
                    open={Boolean(addMenuAnchorEl)}
                    onClose={handleAddMenuClose}
                >
                    {renderAddMenuItems()}
                </Menu>
                {/* <Button onClick={async () => {
                    const from = Date.now()
                    for (const t of todos.values()) {
                        calcWeight_view(t)
                    }
                    console.log(Date.now() - from)
                }}>
                    test
                </Button> */}
                <IconButton
                    disableFocusRipple
                    sx={{ ml: 2 }}
                    color={"inherit"}
                    onClick={(event) => {
                        setKeyboardShortCutHelpVisibility(true);
                    }}
                >
                    <HelpOutline />
                </IconButton>
                <Menu
                    anchorEl={addMenuAnchorEl}
                    open={Boolean(addMenuAnchorEl)}
                    onClose={handleAddMenuClose}
                >
                    {renderAddMenuItems()}
                </Menu>
            </Toolbar>
        </AppBar>
    )
}