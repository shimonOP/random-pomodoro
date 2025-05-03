import { Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Todo, countTodos, getChildren, getTodo, hasCompletedAncestor, hasForcedLeafAncestor, isInInterval, isInTags, isRoot } from "../datas/Todo";
import { UserSettings } from "../datas/UserSettings";
import { todoWeightCalculator_view } from "../hooks/useDiceTodoStates";
import { LightGreyColorCode, GreenColorCode, IndigoColorCode, Drawer_Width, TreeView_MaxWidth, AboveAppContentArea_MinHeight } from "../types/constants";
import { downloadString, getYYYYMMDD, mapToValueArray } from "../util";
import StyledTreeItem from "./StyledTreeItem";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TreeView } from '@mui/lab';
import { DrawerHeader, Todo_Archive_NodeID } from '../AppCore_';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from 'react';
import { TLLContext } from '../App';

export function TodoTreeView(props: {
  todos: Map<string, Todo>,
  expandedTodos: string[],
  expandTreeView: (id: string, isExpanded: boolean, recursive: boolean) => void,
  userSettings: UserSettings,
  calcWeight_view: (todo: Todo) => number,
  focusedTodoID: string,
  setFocusedTodo: (todo: Todo | undefined) => void,
  setIsArchiveFocused: (b: boolean) => void,
  setDrawerOpen: (b: boolean) => void,
  drawerOpen: boolean,
  collapseTreeView: (id: string) => void,
  stringifyAppData: () => Promise<string>,
  setFileImportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
}) {
  const {
    todos,
    expandedTodos,
    expandTreeView,
    userSettings,
    calcWeight_view,
    focusedTodoID,
    setFocusedTodo,
    setIsArchiveFocused,
    setDrawerOpen,
    drawerOpen,
    collapseTreeView,
    stringifyAppData,
    setFileImportDialogOpen,
  } = props;
  const tll = useContext(TLLContext)
  const todoCountsUI = (
    <Stack direction="column" justifyContent={"end"}>
      <Stack sx={{ minHeight: AboveAppContentArea_MinHeight }} direction="row" justifyContent={"end"}>
        <Typography sx={{ color: "grey", marginRight: 1, fontSize: 12 }}>
          {countTodos(todos)}
        </Typography>
      </Stack>
    </Stack>
  )
  const constructRecursionTree = (todosArray: Todo[], type: "todo" | "archive", userSettings: UserSettings) => {
    return [...todosArray.filter(t => !t.isCompleted), ...todosArray.filter(t => t.isCompleted)].filter(t => type !== "todo" || !t.isArchived).map(todo => {
      if (type == "todo" && todo.isArchived) return undefined;

      const now = new Date()
      const children = getChildren(todo, todos).filter(t => !t.isArchived).sort((a, b) => a.title.localeCompare(b.title));
      const hflAncestor = hasForcedLeafAncestor(todo, todos);
      const hcAncestor = hasCompletedAncestor(todo, todos);
      const label_isCustomed = userSettings.useCustomWeight && todoWeightCalculator_view.isCustomed(todo.id) ?
        "🛠️" : ""
      const lable_isForcedLeaf = todo.isForcedLeaf ?
        "🥬" : ""
      const titlelabelspace = (label_isCustomed || lable_isForcedLeaf) ? "   " : ""
      const label = todo.displayTitle + titlelabelspace + label_isCustomed + lable_isForcedLeaf
      return tree();

      function tree() {
        const labelColor =
          (hcAncestor || hflAncestor) ? LightGreyColorCode :
            isInInterval(todo, now) ? GreenColorCode :
              !calcWeight_view(todo) ? LightGreyColorCode :
                userSettings.doRestrictByTags && isInTags(todo, todos, userSettings.timerTags, userSettings.timerExTags) ? IndigoColorCode :
                  '#333333'
        const labelIcon =
          children.length === 0 ? null :
            expandedTodos.includes(todo.id) ? <ExpandMoreIcon /> : <ChevronRightIcon />
        return (
          <StyledTreeItem
            labelIcon={labelIcon}
            onClickedLabel={() => {
              expandTreeView(todo.id, false, false);
            }}
            onClick={(e) => {
            }} className={'treeItem-' + todo.id} key={todo.id} nodeId={todo.id} labelText={label} style={{ color: labelColor }} makeTextLined={todo.isCompleted} >
            {constructRecursionTree(children, type, userSettings)}
          </StyledTreeItem>
        );
      }
    })
  }
  const renderTree = (todos: Map<string, Todo>, userSettings: UserSettings) => {
    const rootTodosArray = mapToValueArray(todos)
      .filter(todo => isRoot(todo) && !todo.needDelete)
      .sort((a, b) => a.title.localeCompare(b.title));
    const todoTree = constructRecursionTree(rootTodosArray, "todo", userSettings);
    return todoTree;
  };
  const treeViewOnFocused = (event: React.SyntheticEvent, id: string) => {
    if (id === Todo_Archive_NodeID) {
      return;
    }

    const focused = getTodo(id, todos);

    setFocusedTodo(focused)
  }
  return (<Drawer
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
        {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
    </DrawerHeader>
    <TreeView
      selected={focusedTodoID}
      expanded={expandedTodos}
      defaultExpanded={['root']}
      defaultExpandIcon={null}
      defaultCollapseIcon={null}
      onNodeFocus={treeViewOnFocused}
      onKeyUp={(e) => {
        if (e.key === "ArrowRight") {
          expandTreeView(focusedTodoID, true, true);
        } else if (e.key === "ArrowLeft") {
          collapseTreeView(focusedTodoID);
        }
      }}
      sx={{ flexGrow: 1, maxWidth: TreeView_MaxWidth, overflowY: 'auto' }}
    >
      {renderTree(todos, userSettings)}
    </TreeView>
    {todoCountsUI}
    <Stack paddingLeft={"5%"} direction={"row"} justifyContent={"left"}>
      <Button color='inherit' onClick={() => {
        setFocusedTodo(undefined);
        setIsArchiveFocused(true);
      }} startIcon={<DeleteIcon></DeleteIcon>}>
        {tll.t("Archive")}
      </Button>
    </Stack>
    <Stack paddingBottom={"5px"} minHeight={50} direction={"row"} justifyContent={'space-evenly'}>
      <Button
        color='inherit'
        sx={{ height: 30 }}
        disableFocusRipple
        id={"importbuttonid"}
        onClick={async (event) => {
          setFileImportDialogOpen(true);
        }}
      >
        import
      </Button>
      <Button
        color='inherit'
        sx={{ height: 30 }}
        disableFocusRipple
        id={"exportbuttonid"}
        onClick={async (event) => {
          const str = await stringifyAppData();
          if (str) {
            const yyyymmdd = getYYYYMMDD()
            downloadString(str, "", "dt_" + yyyymmdd + ".json");
          }
        }}
      >
        export
      </Button>
    </Stack>
  </Drawer>)
}