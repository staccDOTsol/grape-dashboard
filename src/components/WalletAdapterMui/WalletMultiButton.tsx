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
    makeStyles, styled
} from '@mui/material/styles';
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

const StyledMenu = styled(Menu)(({ theme }) => ({
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
}));

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
    const { publicKey, wallet, disconnect } = useWallet();
    const { session, setSession } = useSession();
    const { setOpen } = useWalletDialog();
    const [anchor, setAnchor] = useState<HTMLElement>();
    //const message  = '$GRAPE';

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

    if (!wallet) {
        //if ((session.isConnected)&&(!publicKey))
        //    disconnectSession(false);

        if (session?.publicKey){
            //disconnectSession(false);
            //console.log("1. DISCONNECT!")
        }

        return (
            <WalletDialogButton color={color} variant={variant} {...props}>
                {children}
            </WalletDialogButton>
        );
        
    }
    if (!base58) {
        if (session?.publicKey){
            console.log("Session: "+session.publicKey);
            if (!publicKey){
                // check if wallet?
                console.log("No publicKey, checking wallet availability");
                if (!wallet){
                    console.log("Clearing Session...");
                    disconnectSession(false);
                    console.log("Session cleared.");
                }
            }
        }

        return (
            <WalletConnectButton color={color} variant={variant} {...props}>
                {children}
            </WalletConnectButton>
        );
    }
    
    return (
        <>
            <Button
                color={color}
                variant={variant}
                startIcon={<WalletIcon wallet={wallet} />}
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-controls="wallet-menu"
                aria-haspopup="true"
                //className={styles.root}
                {...props}
            >
                {showWalletAddress(session.publicKey)}
            </Button>
            <StyledMenu
                id="wallet-menu"
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(undefined)}
                marginThreshold={0}
                TransitionComponent={Fade}
                transitionDuration={250}
                keepMounted
            >
                {/*
                <MenuItem onClick={() => setAnchor(undefined)}>
                    
                    <Button
                        color={color}
                        variant={variant}
                        //startIcon={<WalletIcon wallet={wallet} />}
                        className={styles.root}
                        onClick={(event) => {
                            setAnchor(undefined);
                            enqueueSnackbar({'Success': 'copied'}, { variant: 'success' });
                            enqueueSnackbar('Copied address', { variant: 'success'} );
                        }}
                        fullWidth
                        {...props}
                    >
                        {session.publicKey}
                    </Button>
                </MenuItem>
                */}
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
                            disconnect()
                                .catch(() => {
                                    // Silently catch because any errors are caught by the context `onError` handler
                                })
                                .then(() => {
                                    disconnectSession(false);
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
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            disconnect()
                                .catch(() => {
                                    // Silently catch because any errors are caught by the context `onError` handler
                                })
                                .then(() => {
                                    disconnectSession(true);
                                });
                            //setOpen(true);
                        }}
                    >
                        <ListItemIcon>
                            <DisconnectIcon />
                        </ListItemIcon>
                        Disconnect
                    </MenuItem>
                </Collapse>
            </StyledMenu>
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