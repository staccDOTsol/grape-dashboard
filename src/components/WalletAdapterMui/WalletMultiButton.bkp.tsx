import {
    Button,
    ButtonProps,
    Collapse,
    Fade,
    ListItemIcon,
    Menu,
    MenuItem,
} from '@mui/material';

import{
    makeStyles,
} from '@mui/styles';
import CopyIcon from '@mui/icons-material/FileCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { WalletAdapterNetwork, WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Connection, Keypair, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';

import bs58 from 'bs58';
import { sign } from 'tweetnacl';

import { useSnackbar } from 'notistack';
import { useSession } from "../../contexts/session";
import DisconnectIcon from '@mui/icons-material/LinkOff';
import SwitchIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useMemo, useCallback, useState } from 'react';
import { useWalletDialog } from './useWalletDialog';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletDialogButton } from './WalletDialogButton';

import { WalletIcon } from './WalletIcon';
import { isCompositeComponent } from 'react-dom/test-utils';

const useStyles = makeStyles({
    root: {},
    menu: {},
    /*
    menu: {
        '& .MuiList-root': {
            padding: 0,
        },
        '& .MuiMenuItem-root': {
            padding: theme.spacing(1, 2),
            boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',
            '&:not(.MuiButtonBase-root)': {
                padding: 0,
                '& .MuiButton-root': {
                    borderRadius: 0,
                },
            },
            '&:hover': {
                boxShadow:
                    'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
            },
        },
        '& .MuiListItemIcon-root': {
            marginRight: theme.spacing(),
            minWidth: 'unset',
            '& .MuiSvgIcon-root': {
                width: 20,
                height: 20,
            },
        },
    },
    */
});

function trimAddress(addr: string) {
    if (!addr) return null;
    if (addr.length > 10){
            let start = addr.substring(0, 4);
            let end = addr.substring(addr.length - 4);
            return `${start}...${end}`;
    }
    return addr;
  }

  function showWalletAddress(addr: string){
    return (
      <React.Fragment>
        <AccountBalanceWalletOutlinedIcon fontSize="small" sx={{ mr:1 }}  /> {trimAddress(addr)}
      </React.Fragment>
    )
  }

export const WalletMultiButton: FC<ButtonProps> = ({
    color = 'primary',
    variant = 'outlined',
    children,
    ...props
}) => {
    const styles = useStyles();
    const { publicKey, wallet, disconnect, sendTransaction, signMessage } = useWallet();
    const { session, setSession } = useSession();
    const { setOpen } = useWalletDialog();
    const [anchor, setAnchor] = useState<HTMLElement>();
    const message  = '$GRAPE';

    let base58 = useMemo(() => publicKey?.toBase58(), [publicKey]) || null;
    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [children, wallet, base58]);

    const { enqueueSnackbar } = useSnackbar();
    
    //console.log(JSON.stringify(wallet));
    //console.log(JSON.stringify(session));
    
    async function disconnectSession(redirect:boolean) {
        setSession(null);
        if (redirect)
            window.location.href = "/";
    }

    /*
    async function SignSolflare(){
        try{
            // try to sign a transaction
            if (!publicKey) throw new WalletNotConnectedError();
            //let connection = new Connection(clusterApiUrl('mainnet-beta'));
            let connection = new Connection(clusterApiUrl('mainnet-beta'));
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,//Keypair.generate().publicKey,
                    lamports: 1,
                })
            );
            
            

            const transaction_signature = await signTransaction(transaction, connection);
            
            console.log("TS: "+JSON.stringify(transaction_signature));
            return transaction_signature;
        } catch (error: any) {
            console.log(`Signing failed: ${error?.message}`);
            disconnect().catch(() => {});
            //setSession(null);
            return null;
        }
    }
    */

    if (!wallet){
        /*
        return (
            <WalletDialogButton variant={variant} {...props}>
                {children}
            </WalletDialogButton>
        );
        */
        //console.log("no wallet " + publicKey + ' v '+session.publicKey);
    } else{
        if ((!session.publicKey)&&(publicKey)){
            
            if (wallet.adapter.name == "Solflare"){
                console.log("SOLFLARE WALLET!!!!");
                //if (!session.publicKey)
                //   SignSolflare();
            }
            
            return (
                <WalletDialogButton variant={variant} {...props}>
                    {children}
                </WalletDialogButton>
            );
        }
        //console.log("has wallet: "+JSON.stringify(wallet));
    }
    
    if (wallet){
        console.log("Wallet: "+wallet.adapter.name);
        
        // in this rare scenario we need to create the session here?
        // IMPORTANT WE NEED TO HANDLE SOLFLARE & LEDGER WHICH MAY NOT REQUIRE SIGNING????
        // check if wallet can be signed and sign the wallet to proceed
    }
    
    if (!session.publicKey) {
        console.log("no session pk " + publicKey + ' v '+session.publicKey);
        return (
            <WalletDialogButton variant={variant} {...props}>
                {children}
            </WalletDialogButton>
        );
    } else {
        console.log("has session pk " + publicKey + ' v '+session.publicKey);
        if (!publicKey)
            if (session.publicKey)
                base58 = session.publicKey;
    }

    console.log("base: "+base58);

    if (!base58) {
        console.log("no base58 " + publicKey + ' v '+session.publicKey);
        return (
            <WalletConnectButton variant={variant} {...props}>
                {children}
            </WalletConnectButton>
        );
    }

     
    //{wallet.name}

    return (
        <>
            <Button
                color={color}
                variant={variant}
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-controls="wallet-menu"
                aria-haspopup="true"
                className={styles.root}
                {...props}
            >
                {showWalletAddress(session.publicKey)}
            </Button>
            <Menu
                id="wallet-menu"
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(undefined)}
                className={styles.menu}
                marginThreshold={0}
                TransitionComponent={Fade}
                transitionDuration={250}
                keepMounted
            >
                <Collapse in={!!anchor}>
                    <MenuItem
                        onClick={async () => {
                            setAnchor(undefined);
                            await navigator.clipboard.writeText(base58);
                            enqueueSnackbar(`Copied...`,{ variant: 'success' });
                        }}
                    >
                        <ListItemIcon>
                            <CopyIcon />
                        </ListItemIcon>
                        Copy address
                    </MenuItem>
                    <MenuItem
                        component="a"
                        href={`https://explorer.solana.com/address/${session.publicKey}`}
                        target="_blank"
                    >
                        <ListItemIcon>
                            <OpenInNewIcon />
                        </ListItemIcon>
                        Explore
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            disconnectSession(false);
                            disconnect().catch(() => {
                                // Silently catch because any errors are caught by the context `onError` handler
                            });
                            setOpen(true);
                        }}
                    >
                        <ListItemIcon>
                            <SwitchIcon />
                        </ListItemIcon>
                        Connect a different wallet
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            disconnectSession(true);
                            async function disconnect() {
                            }    
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {
                                // Silently catch because any errors are caught by the context `onError` handler
                            });
                        }}
                    >
                        <ListItemIcon>
                            <DisconnectIcon />
                        </ListItemIcon>
                        Disconnect
                    </MenuItem>
                </Collapse>
            </Menu>
        </>

    );
    
    /*
    return (
        <>
            <Button
                color={color}
                variant={variant}
                startIcon={<WalletIcon wallet={wallet} />}
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-controls="wallet-menu"
                aria-haspopup="true"
                className={styles.root}
                {...props}
            >
                {content}
            </Button>
            <Menu
                id="wallet-menu"
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(undefined)}
                className={styles.menu}
                marginThreshold={0}
                TransitionComponent={Fade}
                transitionDuration={250}
                keepMounted
            >
                <MenuItem onClick={() => setAnchor(undefined)}>
                    <Button
                        color={color}
                        variant={variant}
                        startIcon={<WalletIcon wallet={wallet} />}
                        className={styles.root}
                        onClick={(event) => {
                            setAnchor(undefined);
                            enqueueSnackbar({'Success': 'copied'}, { variant: 'success' });
                            enqueueSnackbar('Copied address', { variant: 'success'} );
                        }}
                        fullWidth
                        {...props}
                    >
                        {wallet.name}
                    </Button>
                </MenuItem>
                <Collapse in={!!anchor}>
                    <MenuItem
                        onClick={async () => {
                            setAnchor(undefined);
                            await navigator.clipboard.writeText(base58);

                        }}
                    >
                        <ListItemIcon>
                            <CopyIcon />
                        </ListItemIcon>
                        Copy address
                    </MenuItem>
                    <MenuItem
                        component="a"
                        href={`https://explorer.solana.com/address/${session.publicKey}`}
                        target="_blank"
                    >
                        <ListItemIcon>
                            <OpenInNewIcon />
                        </ListItemIcon>
                        Explore
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            setOpen(true);
                        }}
                    >
                        <ListItemIcon>
                            <SwitchIcon />
                        </ListItemIcon>
                        Connect a different wallet
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setAnchor(undefined);
                            async function disconnect() {
                                //setSession(null);
                                //window.location.href = "/"
                            }    
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect().catch(() => {
                                // Silently catch because any errors are caught by the context `onError` handler
                            });
                        }}
                    >
                        <ListItemIcon>
                            <DisconnectIcon />
                        </ListItemIcon>
                        Disconnect
                    </MenuItem>
                </Collapse>
            </Menu>
        </>
    );
    */
};