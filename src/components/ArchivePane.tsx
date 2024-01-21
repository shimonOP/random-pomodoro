
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { getLevel, getTitles, getTodosArray, Todo } from '../datas/Todo';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from 'react';
import { TLLContext } from '../App';

type ArchivePaneProps = {
    todos: Map<String, Todo>
    onArchiveButtonClicked: (todo: Todo) => void
    onTodoTitleClicked: (todo: Todo) => void
    onDeleteButtonClicked: (todo: Todo) => void
    onRestoreButtonClicked: (todo: Todo) => void
    onDeleteAllTodosInArchiveClicked: () => void
}
const ArchivePane = (props: ArchivePaneProps) => {
    const {
        todos,
        onArchiveButtonClicked,
        onTodoTitleClicked,
        onDeleteButtonClicked,
        onRestoreButtonClicked,
        onDeleteAllTodosInArchiveClicked,
    } = props
    const tll = useContext(TLLContext);
    const todoarray = getTodosArray(todos);
    const archived = todoarray.filter(t => t.isArchived && !t.needDelete).sort((a, b) => getLevel(a, todos) - getLevel(b, todos));
    const completed = todoarray.filter(t => !t.isArchived && !t.needDelete && t.isCompleted).sort((a, b) => getLevel(a, todos) - getLevel(b, todos));
    const typoStyle = { fontSize: "1.2rem", fontWeight: "500" }
    const typoBoxStyle = {
        borderBottom: "1px solid",
        borderColor: "gainsboro"
    }
    const rowStyle = { marginTop: "6px" }
    const createTitle = (t: Todo) => {
        return (
            <Stack justifyContent={"center"}>
                <Button onClick={() => {
                    onTodoTitleClicked(t)
                }}>
                    <Typography
                        style={{ marginRight: "2px", color: "inherit" }}
                    >{getTitles(t, todos).join("/ ")}</Typography>
                </Button>
            </Stack>
        )
    }
    const archivedList = (
        <Stack
            direction="column"
        >
            <Stack direction="row" justifyContent={"space-between"} style={typoBoxStyle}>
                <Stack direction="column" justifyContent={"center"} >
                    <Typography style={typoStyle} >Archived tasks</Typography>
                </Stack>
                <Tooltip title={tll.t("DeleteAll")}>
                    <Button sx={{ color: 'red' }} onClick={onDeleteAllTodosInArchiveClicked}><DeleteIcon /></Button>
                </Tooltip>
            </Stack>
            {
                archived.map(t => {
                    return (
                        <Stack
                            direction="row"
                            justifyContent={"space-between"}
                            style={rowStyle}
                            key = {"ap-"+t.id}
                        >
                            {createTitle(t)}
                            {
                                <Stack direction="row">
                                    <Tooltip title={tll.t("ReturnTask")}>
                                        <IconButton edge="end" onClick={() => { onRestoreButtonClicked(t) }}>
                                            <RestoreFromTrashIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={tll.t("Delete")}>
                                        <IconButton sx={{ color: 'red' }} edge="end" onClick={() => { onDeleteButtonClicked(t) }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            }
                        </Stack>
                    )
                })
            }
        </Stack>
    )
    const completedList = (
        <Stack
            direction="column"
        >
            <Stack direction="row" justifyContent={"space-between"} style={{ marginTop: "20px", ...typoBoxStyle }}>
                <Stack direction="column" justifyContent={"center"} >
                    <Typography style={{ ...typoStyle }}>Completed</Typography>
                </Stack>
                <Button sx={{ color: 'transparent' }} ><DeleteIcon /></Button>
            </Stack>
            {
                completed.map(t => {
                    return (
                        <Stack
                            direction="row"
                            justifyContent={"space-between"}
                            style={rowStyle}
                            key = {"ap-"+t.id}
                        >
                            {createTitle(t)}
                            {
                                <Stack direction="row">
                                    <Tooltip title={tll.t("GoToArchive")}>
                                        <IconButton edge="end" onClick={() => { onArchiveButtonClicked(t) }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            }
                        </Stack>
                    )
                })
            }
        </Stack>
    )
    return (
        <Stack
            direction='column'
        >
            {archivedList}
            {completedList}
        </Stack>
    );
}
export default ArchivePane;