import React from "react"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

import { Button, CardActionArea } from '@mui/material';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InsertLinkIcon from '@mui/icons-material/InsertLink';

import { PublicKey } from '@solana/web3.js';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
    ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export function trimAddress(addr: any, trim:any) {
    let start = addr.substring(0, trim);
    let end = addr.substring(addr.length - trim);
    return `${start}...${end}`;
}

export function ValidateCurve(address:string){
    return PublicKey.isOnCurve(new PublicKey(address).toBuffer());
}

export function ValidateAddress(address:any){
    try{
        if (address){
            //let base58 = useMemo(() => props?.toBase58(), [props]) || null;
            if ((address.length >= 32) && 
                (address.length <= 45)){    
                    return ValidateCurve(address);
            }
            return false;
        }
    } catch(e){console.log("ERR: "+e)};
}

export function MakeLinkableAddress(props:any){
    const addr = props?.addr || "";
    const trim = props?.trim;
    const hasextlink = props?.hasextlink || false;
    const hascopy = props?.hascopy || false;
    const fontsize = props?.fontsize || "16px";
    const permalink = props?.permalink || false;
    const isDNS = props?.isDNS || null;
    
    let stri_addr = addr;
    const [open_snackbar, setSnackbarState] = React.useState(false);
    
    const handleCopyClick = () => {
        setSnackbarState(true);
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarState(false);
    };
    
    if (addr.length > 0){
        if (trim>0)
            stri_addr = trimAddress(addr, trim)
    }

    function ClipboardAction(){
        if (hascopy){
            return (
                <Button size="small" variant="text">
                    <CopyToClipboard 
                    text={addr} 
                    onCopy={handleCopyClick}
                    >
                        <ContentCopyIcon sx={{fontSize:fontsize, mr:0 }} />
                    </CopyToClipboard>
                    <Snackbar open={open_snackbar} autoHideDuration={2000} message="Copied">
                        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        Copied!
                        </Alert>
                    </Snackbar>
                </Button>
            );
        } else{
            return <React.Fragment/>
        }
    }

    function PermalinkAction(){
        if (permalink){
            return (
                <Button size="small" variant="text">
                    <CopyToClipboard 
                    text={window.location.href} 
                    onCopy={handleCopyClick}
                    >
                        <InsertLinkIcon sx={{fontSize:fontsize, ml:1 }} />
                    </CopyToClipboard>
                    <Snackbar open={open_snackbar} autoHideDuration={2000} message="Copied">
                        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        Copied!
                        </Alert>
                    </Snackbar>
                </Button>
            );
        } else{
            return <React.Fragment/>
        }
    }
    
    if (addr.length > 0){
        if (hasextlink){
            return ( 
                <React.Fragment>
                    <ClipboardAction />
                    <Button size="small" variant="text" component="a" href={`https://explorer.solana.com/address/${addr}`} target="_blank">{stri_addr} <OpenInNewIcon sx={{fontSize:fontsize, ml:1}} /></Button>
                    <PermalinkAction />
                </React.Fragment>
            )
        } else {
            return ( 
                <React.Fragment>
                    <ClipboardAction />
                    {isDNS ?
                        <>{addr}</>
                    :
                    <Button size="small" variant="text" component="a" href={`https://explorer.solana.com/address/${addr}`} target="_blank">{stri_addr}</Button>
                    }
                    <PermalinkAction />
                </React.Fragment>
            )
        }
    } else{
        return (
            <React.Fragment>
            </React.Fragment>
        )
    }
}