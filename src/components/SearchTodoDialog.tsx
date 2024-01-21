import { Dialog, DialogContent, Stack, Autocomplete, TextField } from "@mui/material"
import { Todo } from "../datas/Todo"
import { ForwardedRef, forwardRef, useState } from "react"

type SearchTodoDialogProps = {
    onclose: () => void
    onSelect: (newValue: string | Todo | null, shiftEnter: boolean) => void
    open: boolean
    getOptionLabel: (option: Todo | string) => string
    getOptions: (value: string) => (string | Todo)[]
    label: string
}
export const SearchTodoDialog = forwardRef((props: SearchTodoDialogProps, ref: ForwardedRef<unknown>) => {
    const { onclose, open, getOptionLabel, getOptions, onSelect, label } = props;
    const [searchTodoOptions, setSearchTodoOptions] = useState<(Todo | string)[]>([]);
    const optionTo = (option: Todo | string, value: Todo | string) => {
        if (typeof (option) !== "string" && typeof (value) !== "string") {
            return option.id === value.id;
        } else if (typeof (option) === "string" && typeof (value) === "string") {
            return option === value;
        }
        return false
    }
    let shiftEnterPressed = false;
    return (
        <Dialog onClose={onclose} open={open}>
            <DialogContent>
                <Stack minWidth={400}>
                    <Autocomplete
                        freeSolo
                        options={searchTodoOptions}
                        getOptionLabel={getOptionLabel}
                        isOptionEqualToValue={optionTo}
                        onInputChange={(event, newValue) => {
                            const option = getOptions(newValue)
                            setSearchTodoOptions(option)
                        }}
                        onKeyDown={(e) => {
                            if (e.shiftKey && e.key === "Enter") {
                                shiftEnterPressed = true
                            }
                        }}
                        onChange={(event, newValue) => {
                            event.preventDefault()
                            event.stopPropagation()
                            const i =
                                typeof (newValue) !== "string" ? newValue :
                                    newValue === "Home" ? newValue :
                                        searchTodoOptions.length !== 0 ? searchTodoOptions[0] :
                                            null
                            onSelect(i, shiftEnterPressed)
                            shiftEnterPressed = false;
                        }}
                        renderInput={(params) => <TextField inputRef={ref} {...params} label={label} />}
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    );
})