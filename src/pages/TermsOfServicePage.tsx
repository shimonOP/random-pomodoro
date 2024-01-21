
import { Box, Container, Link, Typography } from "@mui/material";
import Footer from "../components/Footer";
import Header from "../components/Header";

const TermsOfServicePage = () => {
    return (
        <Box sx={{ backgroundColor: "white" }}>
            <Container>
                <Header></Header>
                <Typography variant="h3" textAlign={"center"} sx={{ paddingTop: 5, paddingBottom: 5 }}>Terms of service</Typography>
                <Typography variant="h5" >About RandomPomodoro</Typography>
                <Typography variant="body1" >RandomPomodoro is an application for time management, TodoList management, and Todo selection.</Typography>
                <Typography variant="h5" >About the administrator</Typography>
                <Typography variant="body1" > Please contact the administrator on Twitter below.</Typography>
                <Link href="https://twitter.com/tododice1">twitter</Link>
                <Typography variant="h5" >Disclaimer</Typography>
                <Typography variant="body1" > The administrator may change or terminate the contents of this website without prior notice.</Typography>
                {/* <Typography variant="body1" >
                    The administrator is under no obligation to edit or control User Content that you or other users post or publish, and will not be in any way responsible or liable for User Content.
                </Typography> */}
                {/* <Typography variant="body1" >
                    The administrator can at any time and without prior notice, screen, remove, edit, or block any User Content that in his sole judgment.
                </Typography> */}
                <Footer></Footer>
            </Container>
        </Box>
    );
}
export default TermsOfServicePage;