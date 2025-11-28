
import { CircularProgress, Stack, Typography } from "@mui/material";

const LoadingPage = () => {
    return (
        <>
            <Stack direction={"column"} height={500} justifyContent="center">
                <Stack direction={"row"} justifyContent="center">
                    <CircularProgress></CircularProgress>
                </Stack>
            </Stack>
        </>
    );
}
export default LoadingPage;