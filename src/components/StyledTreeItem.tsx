import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

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
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
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
    [`& .${treeItemClasses.group}`]: {
        [`& .${treeItemClasses.content}`]: {
        },
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
        ...other
    } = props;

    return (
        <StyledTreeItemRoot
            label={
                <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: "center", textDecoration: makeTextLined ? "Line-through" : 'none' }}>
                    {<Button
                        disableRipple
                        onClick={(e) => {
                            e.stopPropagation()
                            onClickedLabel()
                        }}
                        color="inherit"
                        sx={{ minWidth: 10, maxWidth: "auto", zIndex: 10000, ml: "-15px", p: "1px", px: "3px" }} >
                        {labelIcon}</Button>}
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {labelText}
                    </Typography>
                    <Typography variant="caption" color="inherit">
                        {labelInfo}
                    </Typography>
                </Box>
            }
            style={{
                '--tree-view-bg-color': bgColor,
            }}
            {...other}
        />
    );
}
