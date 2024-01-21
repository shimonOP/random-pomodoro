import { Add } from "@mui/icons-material";
import { Autocomplete, Box, Chip, IconButton, Popover, Stack, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import { Max_TagName_Length, TagsInputField_MaxHeight } from "../types/constants";

type TagsInputFieldProps = {
    enable: boolean
    tags: string[]
    handleDelete: (name: string) => void
    onChange: (text: string) => string
}
const Tag = (name: string, handleDelete: (name: string) => void) => {
    return (
        <Chip key={name} label={name} onDelete={() => { handleDelete(name) }} />
    )

}
const TagsInputField = (props: TagsInputFieldProps) => {
    const { tags, handleDelete, onChange, enable } = props;
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const inputRef = React.useRef<HTMLDivElement>();
    const [inputError, setInputError] = useState(false);
    useEffect(() => {
        //onchangeに書いても上手くいかなかったのでこうする！！
        if (inputError && text.length <= Max_TagName_Length) {
            setInputError(false);
        }
    })
    return (
        <>
            <Stack>
                <Box sx={{ flexWrap: 'wrap' }}>
                    {tags.length ? tags.map((tag, index) => {
                        return Tag(tag, handleDelete);
                    }) : <Chip label={"tag"}></Chip>}
                    <IconButton
                        disabled={!enable}
                        onClick={(e) => {
                            setAnchorEl(e.currentTarget)
                            //makeshift:ちょっと待たないといけない。多分、表示されないと参照できない。onshowみたいなイベントがあるといいけど
                            setTimeout(() => {
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }, 100)
                        }}>
                        <Add></Add>
                    </IconButton>
                </Box>
            </Stack>
            <Popover
                open={Boolean(anchorEl)}
                onClose={() => { setAnchorEl(null) }}
                anchorEl={anchorEl}>
                <Stack>
                    <Autocomplete
                        options={tags}
                        sx={{ width: 300}}
                        inputValue={text}
                        freeSolo
                        renderInput={(params) => <TextField
                            {...params}
                            label="Tags"
                            error={inputError}
                            variant="standard"
                            inputRef={inputRef}
                            size='small'
                            margin='none'
                            placeholder="Enter Tags here"
                            sx={{ margin: "1rem 0" }}
                        />}
                        ListboxProps={
                            {
                                style: {
                                    maxHeight: TagsInputField_MaxHeight,
                                }
                            }
                        }
                        onInputChange={(event, newInputValue, reason) => {
                            setInputError(newInputValue.length > Max_TagName_Length);
                            setText(newInputValue);
                            if (reason === "reset" && submitted) {
                                setText("");
                                setAnchorEl(null);
                                setSubmitted(false);
                            }
                        }}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                onChange(newValue);
                                setSubmitted(true);
                                setText("");
                            }
                        }}
                    />
                </Stack>
            </Popover>
        </>
    );
}
export default TagsInputField;