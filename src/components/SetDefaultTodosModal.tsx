import { Modal, Box, Stack, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";

type SetDefaultTodosModalProps = {
    okButtonClicked: (titles: string[]) => void,
}
const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    maxWidth: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 5,
    p: 4,
};
export const SetDefaultTodosModal = (props: SetDefaultTodosModalProps) => {
    const { okButtonClicked } = props;
    const placeHolders = ["Working", "Reading Book", "Break", "Training", "", ""]
    const [titles, setTitles] = useState(["", "", "", "", "", ""])
    const TextFields = titles.map((t, index) => {
        return (
            <TextField placeholder={placeHolders[index]} value={t} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                titles[index] = event.target.value
                setTitles([...titles]);
            }}></TextField>
        )
    })
    return (
        <>
            <Modal open={true}>
                <Box sx={modalStyle}>
                    <Stack direction={"column"}>
                        <Typography variant='h5' textAlign={"center"} marginBottom={3}>Please tell me what you want to try.</Typography>
                        {TextFields}
                        <Button variant='contained' sx={{ marginTop: 10 }} onClick={() => {
                            const ress: string[] = []
                            if (titles.some((t) => t !== "")) {
                                titles.map((t) => {
                                    if (t !== "") ress.push(t);
                                })
                            } else {
                                placeHolders.filter(p => p !== "").forEach(p => ress.push(p));
                            }
                            okButtonClicked(ress);
                        }}>OK</Button>
                    </Stack>
                </Box>
            </Modal>
        </ >
    )
}