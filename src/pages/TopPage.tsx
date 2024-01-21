import { Button,} from '@mui/material';
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import RollDiceIcon from "../components/RollDiceIcon";
import dicetodoExampleImage from "../assets/images/dicetodoExample3.png";
import React from 'react';
import { TLLContext } from '../App';
import { Emoji_Faces } from '../types/constants';
import { Link } from 'react-router-dom'

const choseEmojiFace = () => {
    return Emoji_Faces[Math.floor(Math.random() * Emoji_Faces.length)];
}
const TopPage: React.FC = () => {
    const [isRolling, setIsRolling] = useState(false);
    const [emojiFace, setEmojiFace] = useState(choseEmojiFace());
    const tll = React.useContext(TLLContext);
    const rollingDiceMini =
        <IconButton color="secondary" sx={{ textAlign: "center" }} onClick={() => {
            setIsRolling(!isRolling);
            const timespans = [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 1000,]
            for (const timespan of timespans) {
                setTimeout(() => {
                    setEmojiFace(choseEmojiFace());
                }, timespan)
            }
            setTimeout(() => {
                setIsRolling(false);
                setEmojiFace(choseEmojiFace());
            }, 1500)
        }}>
            <RollDiceIcon isRolling={isRolling}></RollDiceIcon>
        </IconButton>
    return (
        <>
            <Container>
                <Header></Header>
                <Typography variant="h3" textAlign={"center"} sx={{ paddingTop: 15, paddingBottom: 5, color: "#555555" }}>{tll.t("CatchSentense1")}</Typography>
                <Stack direction="row" justifyContent={"center"}>
                </Stack>
                <Typography variant="h5" textAlign={"center"} >{emojiFace + tll.t("Let'sTry")}{rollingDiceMini}</Typography>
                <Stack direction="row" justifyContent={"center"} marginTop={10}>
                    <Button
                        variant='contained'
                        component={Link}
                        to="/signinup"
                        style={{ borderRadius: 50 }}
                    >
                        <Typography variant="body1" textAlign={"center"} padding={1}>{tll.t("StartSoon")}</Typography>
                    </Button>
                </Stack>
                <Stack direction="column" >
                    <Stack direction="row" justifyContent={"center"}>
                        <Box
                            boxShadow={10}
                            component="img"
                            sx={{
                                marginTop: 5,
                                textAlign: "center",
                                width: "80vw"
                            }}
                            alt="example image."
                            src={dicetodoExampleImage}
                        />
                    </Stack>
                </Stack>
                <Footer></Footer>
            </Container>
        </>
    );
}
export default TopPage;
