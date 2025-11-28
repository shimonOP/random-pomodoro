import { Typography } from "@mui/material";
import { Link } from "@mui/material";
const Copyright = () => {
    return (
        <>
            <Typography variant="body2" color="text.secondary" align="center" >
                {'Copyright © '}
                <Link color="inherit" href="#">
                    All Right Reserved
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        </>
    );
}
export default Copyright;