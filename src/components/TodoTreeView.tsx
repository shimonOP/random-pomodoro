import { Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Todo, getChildren, getTodo, hasCompletedAncestor, hasForcedLeafAncestor, isInInterval, isInTags, isRoot } from "../datas/Todo";
import { UserSettings } from "../datas/UserSettings";
import { LightGreyColorCode, GreenColorCode, IndigoColorCode, Drawer_Width, TreeView_MaxWidth, AboveAppContentArea_MinHeight } from "../types/constants";
import { downloadString, getYYYYMMDD, mapToValueArray } from "../util";
import StyledTreeItem from "./StyledTreeItem";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DrawerHeader, Todo_Archive_NodeID } from '../AppCore_';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useContext } from 'react';
import { TLLContext } from '../App';
import { SimpleTreeView } from '@mui/x-tree-view';
import { todoWeightCalculator_view } from '../contexts/DiceTodoContext';
import { useIsMobileLayout } from '../hooks/useLayout';

export function TodoTreeView(props: {
  todos: Map<string, Todo>,
  expandedTodos: string[],
  expandTreeView: (id: string, isExpanded: boolean, recursive: boolean) => void,
  userSettings: UserSettings,
  calcWeight_view: (todo: Todo) => number,
  focusedTodoID: string,
  setFocusedTodo: (todo: Todo | undefined) => void,
  collapseTreeView: (id: string) => void,
  onItemClicked?: ()=>void,
  setTodoParameter?: (id: string, params: any) => void,
}) {
  const {
    todos,
    expandedTodos,
    expandTreeView,
    userSettings,
    calcWeight_view,
    focusedTodoID,
    setFocusedTodo,
    collapseTreeView,
    onItemClicked,
    setTodoParameter,
  } = props;
  const isMobileLayout = useIsMobileLayout();

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
            onClick={() => {
              onItemClicked && onItemClicked();
            }}
            className={'treeItem-' + todo.id}
            key={todo.id}
            itemId={todo.id}
            labelText={label}
            style={{ color: labelColor }}
            makeTextLined={todo.isCompleted}
            todo={todo}
            onCompleteToggle={(t: Todo) => {
              if (setTodoParameter) {
                setTodoParameter(t.id, { isCompleted: !t.isCompleted });
              }
            }}
          >
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
  const treeViewOnFocused = (_: React.SyntheticEvent | null, itemId: string) => {
    if (itemId === Todo_Archive_NodeID) {
      return;
    }

    const focused = getTodo(itemId, todos);

    setFocusedTodo(focused)
  }
  return (
    <Stack
      direction="column"
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <SimpleTreeView
        selectedItems={focusedTodoID}
        expandedItems={expandedTodos}
        defaultExpandedItems={['root']}
        onItemFocus={treeViewOnFocused}
        slots={{ expandIcon: EmptyIcon, collapseIcon: EmptyIcon }}
        onKeyUp={(e: React.KeyboardEvent) => {
          if (e.key === "ArrowRight") {
            expandTreeView(focusedTodoID, true, true);
          } else if (e.key === "ArrowLeft") {
            collapseTreeView(focusedTodoID);
          }
        }}
        sx={{
          flexGrow: 1,
          maxWidth: isMobileLayout ? '100%' : TreeView_MaxWidth,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: isMobileLayout ? '60px' : 0,
          paddingLeft: isMobileLayout ? '8px' : 0,
          paddingRight: isMobileLayout ? '8px' : 0,
          paddingTop: isMobileLayout ? '8px' : 0,
          // モバイルでのスムーズなスクロール
          WebkitOverflowScrolling: 'touch',
          // スクロールバーのスタイリング（モバイルでは非表示）
          '&::-webkit-scrollbar': {
            width: isMobileLayout ? '0px' : '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isMobileLayout ? 'transparent' : 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
        }}
      >
        {renderTree(todos, userSettings)}
      </SimpleTreeView>
    </Stack>
  )
}
const EmptyIcon = () => <span />;