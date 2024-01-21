import { Dialog, DialogTitle, DialogContent, Stack, Typography, Chip, Divider, Box, Link } from "@mui/material";
import { useContext } from "react";
import { TLLContext } from "../App";

type KeyBoardShortCutHelpProps = {
    onclose: () => void
    open: boolean
    keyAndDescs: { key: string, desc: string }[]
}
const KeyBoardShortCutHelp = (props: KeyBoardShortCutHelpProps) => {
    const { onclose, open, keyAndDescs } = props;
    const tll = useContext(TLLContext);
    const renderOneRow = (desc: string, key: string) => {
        return (
            <Box key={key + "SCK"}>
                <Divider></Divider>
                <Stack direction={"row"} justifyContent="space-between" spacing={10}>
                    <Typography>{desc}</Typography>
                    <Typography>{key}</Typography>
                </Stack>
            </Box>
        )
    }
    const descriptionRows = keyAndDescs.map((value) => {
        const desc = value.desc
        const key = value.key
        return renderOneRow(desc, key)
    }
    )
    return (
        <>
            <Dialog open={open} onClose={onclose} >
                <DialogTitle>{tll.t("KeyBoardShortCutHelp")}</DialogTitle>
                <DialogContent >
                    <Stack>
                        {descriptionRows}
                        <Link marginTop={2} href='https://twitter.com/tododice1'><Typography variant='body2'>{tll.t("ContactUs")}</Typography></Link>
                        <Link marginTop={2} href='/privacy-policy/'><Typography variant='body2'>{tll.t("PrivacyPolicy")}</Typography></Link>
                        <Link marginTop={2} href='/terms-of-service/'><Typography variant='body2'>{tll.t("TermsOfService")}</Typography></Link>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
}
export default KeyBoardShortCutHelp