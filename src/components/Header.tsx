import * as React from 'react';
import { Link } from 'react-router-dom'
import { TLLContext } from '../App';

export default function Header() {
    const tll = React.useContext(TLLContext);
    return (
        <div style={{ display: 'flex', flexDirection: 'row', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
                <h1 className="text-4xl text-primary">
                    <Link to={"/"}>
                        RandomPomodoro
                    </Link>
                </h1>
            </div>
        </div>
    );
}