import { Breadcrumbs, Link, Stack, Tooltip } from "@mui/material";
import { TodoBreadCrumbs_FontSize } from '../types/constants';
import { getAncestors, getChildren, Todo, isInInterval, getRootTodos } from '../datas/Todo';
import { useEffect, useState } from "react";
import { copyMap } from "../util";

type TodoBreadCrumbsProps = {
    todo: Todo | undefined
    todos: Map<String, Todo>
    linkOnClick: (todo: Todo) => void
}
const TodoBreadCrumbs = (props: TodoBreadCrumbsProps) => {
    const { todo, todos, linkOnClick } = props;
    const [openMap, setOpenMap] = useState<Map<string, boolean>>(new Map())
    const [openRoot, setOpenRoot] = useState<boolean>(false)
    const ancestors = todo ? getAncestors(todo, todos) : [];
    useEffect(() => {
        const map = new Map();
        for (const a of ancestors) {
            map.set(a.id, false);
        }
        setOpenMap(map);
    }, [todo, todos]);

    const handleTipToggle = (id: string, willOpen: boolean) => {
        const map_n = copyMap(openMap)
        map_n.set(id, willOpen)
        setOpenMap(map_n)
    }
    const renderTipsLinks = (t: Todo | null) => {
        const now = new Date()
        const todos_list = (t !== null ?
            (getChildren(t, todos)) :
            getRootTodos(todos))
            .filter(t => !t.isArchived && !t.needDelete).sort((a, b) => a.title.localeCompare(b.title))

        const todo2UI = (s: Todo) => {
            const color = (s.isCompleted || isInInterval(s, now)) ? "silver" : "white"
            return (
                <Tooltip
                    key={s.id}
                    title={renderTipsLinks(s)}
                    placement="right"
                >
                    <Link
                        style={{ "color": color }}
                        component="button"
                        onClick={() => {
                            linkOnClick(s)
                            handleTipToggle(s.id, false)
                        }}>
                        {s.displayTitle}
                    </Link>
                </Tooltip>
            )
        }
        return (
            <Stack direction={"column"}>
                {todos_list.map(todo2UI)}
            </Stack>
        )
    }
    const rootLink = <Tooltip
        key={"root"}
        open={openRoot}
        onClose={() => { setOpenRoot(false) }}
        onOpen={() => { setOpenRoot(true) }}
        title={
            <Stack>
                {renderTipsLinks(null)}
            </Stack>}>
        <Link
            fontSize={TodoBreadCrumbs_FontSize}
            underline="hover"
            color="inherit"
            component="button"
            tabIndex={-1}
            onClick={() => {
            }}>{"~"}</Link>
    </Tooltip>
    const links = ancestors.map((t) => {
        return (
            <Tooltip
                key={t.id}
                open={openMap.has(t.id) ? openMap.get(t.id) : false}
                onClose={() => { handleTipToggle(t.id, false) }}
                onOpen={() => { handleTipToggle(t.id, true) }}
                title={
                    <Stack>
                        {renderTipsLinks(t)}
                    </Stack>}>
                <Link
                    fontSize={TodoBreadCrumbs_FontSize}
                    underline="hover"
                    color="inherit"
                    component="button"
                    tabIndex={-1}
                    onClick={() => {
                        linkOnClick(t);
                    }}>{t.displayTitle}</Link>
            </Tooltip>
        );
    })
    links.unshift(
        rootLink
    )
    return (
        <Breadcrumbs aria-label="breadcrumb">
            {links}
        </Breadcrumbs>
    );
}
export default TodoBreadCrumbs;