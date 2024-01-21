import { Container, Typography } from "@mui/material";
import Footer from "../components/Footer";
import Header from "../components/Header";

const HowToUsePage = () => {
    return (
        <>
            <Container>
                <Header></Header>
                <Typography variant="h3" textAlign={"center"} sx={{ paddingTop: 15, paddingBottom: 5, color: "#2F2F2F" }}>How to use &#x1f9d0;</Typography>
                <Typography variant="h4" >Activity Cycle &#x1F600;</Typography>
                <Typography variant="h5" >1. Roll dice</Typography>
                <Typography variant="body1" >First, roll the dice to determine the next task to do.</Typography>
                <Typography variant="h5" >2. Start activity</Typography>
                <Typography variant="body1" >You can set a time limit for each task, and you do that task for that time.</Typography>
                <Typography variant="h5" >3. Record activity</Typography>
                <Typography variant="body1" >An alarm will sound when the set time has elapsed. You can record your efforts by pressing the done button.</Typography>
                <Typography variant="body1" >Back to 1.</Typography>
                <Typography variant="h4" >Todo list creation &#x1f974;</Typography>
                <Typography variant="body1" >A TodoList can be created in a hierarchical order. For example, under Study Todo, you can include detailed categories such as English and Math.
If you want to study twice as much English as you do math, you can set the weight of English to twice the weight of math.</Typography>
                <Typography variant="h4" >Concept of Dice Todo 	&#x1f633;</Typography>
                <Footer></Footer>
            </Container>
        </>
    );
}
export default HowToUsePage;