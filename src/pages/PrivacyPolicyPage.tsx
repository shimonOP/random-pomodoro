import { Box, Container, Typography } from '@mui/material';
import Footer from "../components/Footer";
import Header from "../components/Header";

const PrivacyPolicyPage = () => {
    return (
        <Box sx={{ backgroundColor: "white" }}>
            <Container>
                <Header></Header>
                <Typography variant="h3" textAlign={"center"} sx={{ paddingTop: 5, paddingBottom: 5 }}>Privacy policy</Typography>
                <Typography variant="h5" >Information we collect</Typography>
                {/* <Typography variant="body1" >Registration information.</Typography> */}
                {/* <Typography variant="body1" >Information you generate when using DiceTodo.</Typography> */}
                {/* <Typography variant="body1" >Payment information.</Typography> */}
                <Typography variant="body1" >Nothing.</Typography>
                <Typography variant="h5" >Purpose of use</Typography>
                {/* <Typography variant="body1" >For accepting registrations, identity verification, user authentication, and recording user settings related to this service</Typography> */}
                <Typography variant="body1" >For providing this services.</Typography>
                {/* <Typography variant="body1" >For measuring user traffic and behavior</Typography> */}
                <Typography variant="body1" ></Typography>
                <Typography variant="body1" ></Typography>
                <Typography variant="body1" ></Typography>
                <Footer></Footer>
            </Container>
        </Box>
    );
}
export default PrivacyPolicyPage;