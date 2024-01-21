import { Stack, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";

type CustomWeightEditorProps = {
    onSetButtonClick: (text: string) => void
    onRunButtonClick: (text: string) => void
    text: string
}
export const CustomWeightEditor = ((props: CustomWeightEditorProps) => {
    const { onSetButtonClick, onRunButtonClick, text } = props;
    const [oText, setOText] = useState(text)
    useEffect(() => {
        setOText(text)
    }, [text])
    return (
        <Stack>
            <Stack direction="row">
                <Button onClick={() => {
                    onRunButtonClick(oText)
                }}>run</Button>
                <Button onClick={() => {
                    onSetButtonClick(oText)
                }}>
                    set
                </Button>
            </Stack>
            <Editor
                value={oText}
                language="javascript"
                height={"400px"}
                options={{
                    tabSize: 2,
                    renderLineHighlight: "none",
                    minimap: { enabled: false },
                    lineNumbers: "off",
                    glyphMargin: false,
                    folding: false,
                    // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
                    lineDecorationsWidth: 6,
                    lineNumbersMinChars: 0,
                    padding: { top: 1, bottom: 0 },
                }}
                onChange={(value) => {
                    if (value !== undefined)
                        setOText(value)
                }}
            ></Editor>

        </Stack>
    );
})