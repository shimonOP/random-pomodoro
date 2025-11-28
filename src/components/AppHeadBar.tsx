import { Todo, getTodosArray } from "../datas/Todo";
import { mapToValueArray } from "../util";
import { useContext, useState } from "react";
import { TLLContext } from "../App";
import { HelpOutline } from "@mui/icons-material";
import { addTodoToInboxButton_ID } from "../AppCore_";
import { Drawer_Width } from "../types/constants";
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIMG from '../assets/images/homeIcon.webp';

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
                <li key={t.id + "iAddMenu"}>
                    <a onClick={() => {
                        onClickProcess(t)
                    }}>{t.displayTitle + " +"}</a>
                </li>);
        })
        menus.unshift(
            <li key={"HomeIAddMenu"}>
                <a onClick={() => {
                    onClickProcess(undefined);
                }}>Home +</a>
            </li>)
        return menus;
    }
    const [hoveredFavId, setHoveredFavId] = useState<string | null>(null);

    const favoriteTodoLinks = mapToValueArray(todos).filter(t => t.isFavorite && !t.isArchived)
        .map(t => {
            return (
                <div key={"fav-" + t.id} className="dropdown dropdown-hover">
                    <button
                        className="btn btn-ghost"
                        tabIndex={0}
                        onClick={() => {
                            setFocusedTodo(t)
                            setWillExpandTreeLateId(t.id)
                        }}
                    >
                        {t.displayTitle}
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        <li>
                            <a onClick={() => {
                                setRprobs([]);
                                setRunningTodo_withProc(t);
                            }}>
                                {tll.t("SetTaskToTimer")}
                            </a>
                        </li>
                        <li>
                            <a onClick={() => {
                                interruptTodo(t)
                            }}>
                                {tll.t("InterruptTodo")}
                            </a>
                        </li>
                        <li>
                            <a onClick={() => {
                                appendTodo(t)
                            }}>
                                {tll.t("AppendTodo")}
                            </a>
                        </li>
                    </ul>
                </div>
            )
        })
    return (
        <div
            id="RPApp-AppBar"
            className="navbar bg-base-100 border-b border-base-300 fixed top-0 z-50"
            style={{
                width: drawerOpen ? `calc(100% - ${Drawer_Width}px)` : '100%',
                marginLeft: drawerOpen ? `${Drawer_Width}px` : 0,
                transition: 'margin 0.3s, width 0.3s',
                minHeight: '48px',
                height: '48px',
                padding: '0.25rem 1rem'
            }}
        >
            <button
                className="btn btn-ghost btn-sm"
                aria-label="open drawer"
                onClick={() => { setDrawerOpen(true) }}
                style={{ marginRight: '0.5rem', color: "grey", display: drawerOpen ? 'none' : 'flex' }}
            >
                <MenuIcon />
            </button>
            <div className="flex-1 text-left">
                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }}>
                    <button
                        style={{ marginRight: 6 }}
                        onClick={() => {
                            setFocusedTodo(undefined)
                        }}
                    >
                        <img
                            style={{ height: "20px" }}
                            src={HomeIMG}
                            alt="home image"
                        />
                    </button>
                    {favoriteTodoLinks}
                </div>
            </div>
            <div className={`tooltip ${addTodoHelpOpen ? 'tooltip-open' : ''}`} data-tip="click here to create todolist">
                <button
                    className="btn btn-ghost btn-sm"
                    id={addTodoToInboxButton_ID}
                    onClick={(event) => {
                        addTodoToInbox();
                    }}
                >
                    <AddIcon />
                </button>
            </div>
            {addMenuAnchorEl && (
                <ul className="menu bg-base-100 rounded-box shadow absolute top-12 right-32 z-50">
                    {renderAddMenuItems()}
                </ul>
            )}
            <button
                className="btn btn-ghost btn-sm ml-2"
                onClick={(event) => {
                    setKeyboardShortCutHelpVisibility(true);
                }}
            >
                <HelpOutline />
            </button>
        </div>
    )
}