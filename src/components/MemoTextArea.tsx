/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { useContext, useEffect, useState, useRef } from "react";
import { Box, IconButton, css } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { TLLContext } from "../App";
import { Editor } from "@monaco-editor/react";
import toast from "react-hot-toast";

type MemoTextAreaProps = {
    disabled: boolean
    todo_id: string
    text: string
    onChanged: (newText: string) => void
}
const MemoTextArea = (props: MemoTextAreaProps) => {
    const { disabled, todo_id: id, text, onChanged } = props;
    const [monacoValue, setMonacoValue] = useState(text);
    const tll = useContext(TLLContext);
    // 最新のmonacoValueを保持するref（cleanup時に使用）
    const monacoValueRef = useRef(monacoValue);
    // onChangedの最新版を保持するref
    const onChangedRef = useRef(onChanged);
    // 初期テキストを保持するref（変更があったかの判定用）
    const initialTextRef = useRef(text);

    // refを常に最新に保つ
    useEffect(() => {
        monacoValueRef.current = monacoValue;
    }, [monacoValue]);

    useEffect(() => {
        onChangedRef.current = onChanged;
    }, [onChanged]);

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

    // IDが変わった時のみ外部のtextで初期化する
    useEffect(() => {
        setMonacoValue(text);
        initialTextRef.current = text;
    }, [id])

    // コンポーネントがアンマウントされる時に変更があれば保存
    useEffect(() => {
        return () => {
            if (monacoValueRef.current !== initialTextRef.current) {
                onChangedRef.current(monacoValueRef.current);
            }
        };
    }, [id]);

    // onBlur時に変更があれば保存
    const handleBlur = () => {
        if (monacoValue !== initialTextRef.current) {
            onChanged(monacoValue);
            initialTextRef.current = monacoValue;
        }
    };

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
                onChange={(value) => {
                    if (value !== undefined) {
                        setMonacoValue(value);
                    }
                }}
                onMount={(editor) => {
                    // エディタがマウントされた時にblurイベントを設定
                    editor.onDidBlurEditorWidget(handleBlur);
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