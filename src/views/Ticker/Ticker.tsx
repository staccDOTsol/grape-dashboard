import * as React from 'react';
import Typography from '@mui/material/Typography';



export default function Ticker(props: any) {
    //const theme = useTheme();
    const ticker = props.ticker;
    const subtitle = props.subtitle;
    const showtimestamp = props.showtimestamp;

    return (
        <React.Fragment>
        SUMMARY <small>{subtitle}</small><br/>
        <Typography component="p" variant="h4">
            {props.children}
        </Typography>
        {showtimestamp &&
            <Typography color="text.secondary" sx={{ flex: 1 }}>
            {new Date().toLocaleString()}
            </Typography>
        } 
        <div>
            {/*
            <Link color="primary" href="#" onClick={preventDefault}>
            View balance
            </Link>
            */}
        </div>
        </React.Fragment>
    );
}