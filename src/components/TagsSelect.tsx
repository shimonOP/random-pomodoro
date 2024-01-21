import { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { Autocomplete, Box, Chip, IconButton, Popover, Stack, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";
import { Max_TagName_Length } from "../types/constants";

type TagsSelectProps = {
    labelWhenTagsEmpty: string | undefined
    tags: string[]
    allTags: string[]
    handleDelete: (name: string) => void
    onChange: (text: string) => string
    placeHolder: string
    icon: EmotionJSX.Element
}
const Tag = (name: string, handleDelete: (name: string) => void) => {
    return (
        <Chip key={name} label={name} onDelete={() => { handleDelete(name) }} />
    )
}
const TagsSelect = (props: TagsSelectProps) => {
    const { tags, allTags, handleDelete, onChange, placeHolder, labelWhenTagsEmpty, icon } = props;
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState(false);//タグを確定した後にtextを空にするための
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const inputRef = React.useRef<HTMLDivElement>();
    const [inputError, setInputError] = useState(false);
    const tagsUI = (
        tags.length ? tags.map((tag, index) => { return Tag(tag, handleDelete); }) :
            labelWhenTagsEmpty ? <Chip label={labelWhenTagsEmpty}></Chip> :
                <></>
    )
    return (
        <>
            <Stack direction={"row"}>
                <Box sx={{ flexWrap: 'wrap' }}>
                    <IconButton
                        onClick={(e) => {
                            setAnchorEl(e.currentTarget)
                            //makeshift:ちょっと待たないといけない。多分、表示されないと参照できない。onshowみたいなイベントがあるといいけど
                            setTimeout(() => {
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }, 100)
                        }}>
                        {icon}
                    </IconButton>
                    {tagsUI}
                </Box>
                <Popover
                    open={Boolean(anchorEl)}
                    onClose={() => { setAnchorEl(null) }}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    anchorEl={anchorEl}>
                    <Stack>
                        <Autocomplete
                            sx={{ width: 200 }}
                            options={allTags}
                            inputValue={text}
                            renderInput={(params) => <TextField
                                {...params}
                                label="Tags"
                                error={inputError}
                                variant="standard"
                                inputRef={inputRef}
                                margin='none'
                                placeholder={placeHolder}
                                sx={{ margin: "1rem 0" }}
                            />}
                            onInputChange={(event, newInputValue, reason) => {
                                if (newInputValue.length > Max_TagName_Length) {
                                    setInputError(true);
                                } else {
                                    setInputError(false);
                                }
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
            </Stack>
        </>
    );
}
export default TagsSelect;