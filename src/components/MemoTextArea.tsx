/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { useContext, useEffect, useState } from "react";
import { Box, IconButton, css } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { useSnackbar } from "notistack";
import { TLLContext } from "../App";
import { Editor, useMonaco } from "@monaco-editor/react";

type Value = { id: string, text: string }
type MemoTextAreaProps = {
    disabled: boolean
    id: string
    text: string
    onBlur: (value: Value) => void
    onBeforeUnload: (value: Value) => void
}
let tempValue: Value = { id: "", text: "" }  //onuploadではreactstateが参照できない
const MemoTextArea = (props: MemoTextAreaProps) => {
    const { disabled, id, text, onBlur, onBeforeUnload } = props;
    let [monacoValue, setMonacoValue] = useState("")
    const monaco = useMonaco();
    const setValue_wrap = (value: Value) => {
        tempValue = value
        return setMonacoValue(value.text)
    }
    const { enqueueSnackbar } = useSnackbar();
    const tll = useContext(TLLContext);
    useEffect(() => {
        if (monaco) {
            //add blur event
            monaco.editor.getEditors().forEach((editor) => {
                editor.onDidBlurEditorText(() => {
                    onBlur(tempValue)
                })
            })
        }
    }, [monaco])
    useEffect(() => {
        //画面遷移しようとする前に確認ダイアログを出す.
        const setonbefore = () => {
            const onbefore = function () {
                onBeforeUnload(tempValue)
                //Chromeでは動かない.デフォルトの文言が表示される.
                return 'OK?';
            };
            window.onbeforeunload = onbefore
        }
        setonbefore();
    }, [])
    useEffect(() => {
        setValue_wrap({ id, text })
    }, [id, text])
    return (
        <Box position={"relative"} /*relativeにしないとボタンがはみ出す */ >
            <IconButton css={
                css`
                &:hover {
                    opacity: 50;
                }
            `} sx={{ position: "absolute", right: 0, opacity: 0, zIndex: 100 }} onClick={(e) => {
                    navigator.clipboard.writeText(monacoValue)
                    enqueueSnackbar(tll.t("CopySuccess"), { variant: "success" });
                }}><CopyAllIcon></CopyAllIcon></IconButton>
            <Editor
                css={css`
                    border: 1px solid #d9d9d9;
                    border-radius: 5px;
                    `}
                onChange={(monacoValue) => {
                    if (monacoValue !== undefined) {
                        setValue_wrap({ id, text: monacoValue })
                    }
                }}
                options={{
                    tabSize: 2,
                    renderLineHighlight: "none",
                    minimap: { enabled: false },
                    readOnly: disabled,
                    lineNumbers: "off",
                    glyphMargin: false,
                    folding: false,
                    // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
                    lineDecorationsWidth: 6,
                    lineNumbersMinChars: 0,
                    padding: { top: 1, bottom: 0 },
                }}
                height="300px"
                width="100%"
                value={monacoValue}
            />
        </Box>
    );
}
export default MemoTextArea;