import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { TLL, transKeyBoardShortCutHelps } from '../langs/TransLangs';
import { KeyShortCutter } from '../types/KeyShortCutter';
import { disableKeyBoardShortCut } from '../util';
//@@short cut keys
const shortCutKeys = ["ctrl+Enter", "shift+Enter", "shift+c","shift+/", "/"] as const;
export type ShortCutKey = typeof shortCutKeys[number];

export const addChildSCK: ShortCutKey = "ctrl+Enter";
export const addBrotherSCK: ShortCutKey = "shift+Enter";
export const changeFCompleteSCK: ShortCutKey = "shift+c";
export const showKeyBoardShortCutKeyHelpSCK: ShortCutKey = "shift+/"
export const showSearchTodoDialogSCK: ShortCutKey = "/"
export const shortCutKeyAndTransNames: { key: ShortCutKey, transName: transKeyBoardShortCutHelps }[] = [
    { key: addChildSCK, transName: "AddChildSCK" },
    { key: addBrotherSCK, transName: "AddBrotherSCK" },
    { key: changeFCompleteSCK, transName: "FMakeCompleteSCK" },
    { key: showKeyBoardShortCutKeyHelpSCK, transName: "ShowKeyBoardShortCutKeyHelpSCK" },
    { key: showSearchTodoDialogSCK, transName: "ShowSearchTodoDialogSCK" },
]
const keyShortCutter = new KeyShortCutter<ShortCutKey>(shortCutKeys);
export const shortCutKeyToFunc = new Map<ShortCutKey, () => Promise<any>>()
export const useShortCutKeys = (tll: TLL) => {
    const [shortCutKey, setShortCutKey] = useState<ShortCutKey | undefined>(undefined);

    useHotkeys(addBrotherSCK, () => { pSetCommand(addBrotherSCK) });
    useHotkeys(addChildSCK, () => { pSetCommand(addChildSCK) });
    useHotkeys(changeFCompleteSCK, () => { pSetCommand(changeFCompleteSCK) });
    useHotkeys(showKeyBoardShortCutKeyHelpSCK, () => { pSetCommand(showKeyBoardShortCutKeyHelpSCK) });
    useHotkeys(showSearchTodoDialogSCK, () => { pSetCommand(showSearchTodoDialogSCK) });

    useEffect(() => {
        disableKeyBoardShortCut(shortCutKeys);
    }, [])
    useEffect(() => {
        executeShortCutKey(shortCutKey);
    }, [shortCutKey])

    const pSetCommand = (command: ShortCutKey) => {
        if (keyShortCutter.getStatus(command) === "running") return;

        setShortCutKey(command);
    }
    //なぜ直接実行しないのか？→Todosなどを参照できない
    const shortCutKeysAndHelps = shortCutKeyAndTransNames.map((v) => { return { key: v.key, desc: tll.t(v.transName) } });
    const executeShortCutKey = (shortCutKey: ShortCutKey | undefined) => {
        if (!shortCutKey || keyShortCutter.getStatus(shortCutKey) === "running") return;
        keyShortCutter.setRunning(shortCutKey);
        execute();
        setShortCutKey(undefined);
        return;

        function execute() {
            if (!shortCutKey) return;
            const func = shortCutKeyToFunc.get(shortCutKey);
            if (func) {
                func().then(
                    () => keyShortCutter.done(shortCutKey)
                );
            }
        }
    }
    return {
        shortCutKeysAndHelps
    }
}