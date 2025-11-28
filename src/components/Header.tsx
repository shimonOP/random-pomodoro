import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Stack } from '@mui/material';
import { Link } from 'react-router-dom'
import { TLLContext } from '../App';
export default function Header() {
    const tll = React.useContext(TLLContext);
    return (
        <Stack direction="row" sx={{ paddingTop: 2 }}>
            <Stack direction="row" sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="div"  color='primary'>
                    <Link to={"/"}>
                        RandomPomodoro
                    </Link>
                </Typography>
            </Stack>
        </Stack>
    );
}