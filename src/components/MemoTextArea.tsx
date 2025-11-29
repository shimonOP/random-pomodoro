/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { useContext, useEffect, useState, useRef } from "react";
import { Box, IconButton, css } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { TLLContext } from "../App";
import { Editor, useMonaco } from "@monaco-editor/react";
import { set } from "lodash";
import toast from "react-hot-toast";

type MemoTextAreaProps = {
    disabled: boolean
    todo_id: string
    text: string
    onChanged: (newText: string) => void
    debounceMs?: number
}
const MemoTextArea = (props: MemoTextAreaProps) => {
    const { disabled, todo_id: id, text, onChanged, debounceMs = 300 } = props;
    let [monacoValue, setMonacoValue] = useState("")
    const tll = useContext(TLLContext);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        //画面遷移しようとする前に確認ダイアログを出す.
        const setonbefore = () => {
            const onbefore = function () {
                //Chromeでは動かない.デフォルトの文言が表示される.
                return 'OK?';
            };
            window.onbeforeunload = onbefore
        }
        setonbefore();
    }, [])
    useEffect(() => {
        setMonacoValue(text)
    }, [id, text])

    useEffect(() => {
        return () => {
            // クリーンアップ: コンポーネントがアンマウントされる時にタイマーをクリア
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);
    return (
        <Box position={"relative"} /*relativeにしないとボタンがはみ出す */ >
            <IconButton css={
                css`
                &:hover {
                    opacity: 50;
                }
            `} sx={{ position: "absolute", right: 0, opacity: 0, zIndex: 100 }} onClick={(e) => {
                    navigator.clipboard.writeText(monacoValue)
                    toast.success(tll.t("CopySuccess"));
                }}><CopyAllIcon></CopyAllIcon></IconButton>
            <Editor
                css={css`
                    border: 1px solid #d9d9d9;
                    border-radius: 5px;
                    `}
                onChange={(monacoValue) => {
                    if (monacoValue !== undefined) {
                        setMonacoValue(monacoValue);

                        // 既存のタイマーをクリア
                        if (debounceTimerRef.current) {
                            clearTimeout(debounceTimerRef.current);
                        }

                        // 新しいタイマーを設定
                        debounceTimerRef.current = setTimeout(() => {
                            onChanged(monacoValue);
                        }, debounceMs);
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