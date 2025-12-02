import * as React from 'react';
import { alpha, styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import Typography from '@mui/material/Typography';
import { Button, useMediaQuery, IconButton } from '@mui/material';
import { useIsMobileLayout } from '../hooks/useLayout';
import { Todo } from '../datas/Todo';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

declare module 'react' {
    interface CSSProperties {
        '--tree-view-color'?: string;
        '--tree-view-bg-color'?: string;
    }
}

type StyledTreeItemProps = TreeItemProps & {
    bgColor?: string;
    color?: string;
    labelIcon?: React.ReactNode;
    labelInfo?: string;
    labelText: string;
    onClickedLabel: () => void
    makeTextLined: boolean;
    todo?: Todo;
    onCompleteToggle?: (todo: Todo) => void;
};

const StyledTreeItemRootDesktop = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
        paddingLeft: theme.spacing(0),
        paddingTop: theme.spacing(0.1),
        paddingBottom: theme.spacing(0.1),
        borderTopRightRadius: theme.spacing(0.5),
        borderBottomRightRadius: theme.spacing(0.5),
        fontWeight: theme.typography.fontWeightMedium,
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
        },
        [`& .${treeItemClasses.label}`]: {
            fontWeight: 'inherit',
        },
    },
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: theme.spacing(2),
        paddingLeft: 0,
        borderLeft: `1px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
    },
}));

const StyledTreeItemRootMobile = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
        paddingLeft: theme.spacing(0),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        borderTopRightRadius: theme.spacing(1),
        borderBottomRightRadius: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        minHeight: '48px',
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
        },
        [`& .${treeItemClasses.label}`]: {
            fontWeight: 'inherit',
        },
    },
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: theme.spacing(1.5),
        paddingLeft: 0,
        borderLeft: `2px solid ${alpha(theme.palette.text.secondary, 0.15)}`,
    },
}));

export default function StyledTreeItem(props: StyledTreeItemProps) {
    const {
        bgColor,
        color,
        labelIcon,
        labelInfo,
        labelText,
        makeTextLined,
        onClickedLabel,
        todo,
        onCompleteToggle,
        ...other
    } = props;

    const theme = useTheme();
    const isMobile = useIsMobileLayout();
    const StyledTreeItemRoot = isMobile ? StyledTreeItemRootMobile : StyledTreeItemRootDesktop;

    return (
        <StyledTreeItemRoot
            label={
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: "center",
                    textDecoration: makeTextLined ? "Line-through" : 'none',
                    gap: isMobile ? 0.5 : 0,
                    paddingY: isMobile ? 0.25 : 0,
                }}>
                    {<Button
                        disableRipple
                        onClick={(e) => {
                            e.stopPropagation()
                            onClickedLabel()
                        }}
                        color="inherit"
                        sx={{
                            minWidth: isMobile ? 32 : 10,
                            maxWidth: "auto",
                            zIndex: 10000,
                            ml: isMobile ? "-12px" : "-20px",
                            p: isMobile ? "6px" : "1px",
                            px: isMobile ? "8px" : "1px",
                            // モバイルでのタップ領域拡大
                            '&:active': isMobile ? {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            } : {},
                        }} >
                        {labelIcon}</Button>}
                    <Typography
                        variant="body1"
                        sx={{
                            flexGrow: 1,
                            fontSize: isMobile ? '0.95rem' : '1rem',
                            lineHeight: isMobile ? 1.4 : 1.5,
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {labelText}
                    </Typography>
                    <Typography variant="caption" color="inherit">
                        {labelInfo}
                    </Typography>
                    {/* 鍵アイコン（モバイルのみ） */}
                    {isMobile && todo && onCompleteToggle && (
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onCompleteToggle(todo);
                            }}
                            sx={{
                                padding: '4px',
                                marginRight: '-8px',
                            }}
                        >
                            {todo.isCompleted ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>
                    )}
                </Box>
            }
            style={{
                '--tree-view-bg-color': bgColor,
            }}
            {...other}
        />
    );
}
