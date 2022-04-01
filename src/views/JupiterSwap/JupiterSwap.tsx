// ADD CODE FOR JUPITAR SWAP IMPLEMENTATION
import React, {FC, useCallback, useEffect, useState} from 'react';
import SwapDialog from "../Swap/SwapDialog";
import {WalletAdapterNetwork, WalletError, WalletNotConnectedError} from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, Signer } from '@solana/web3.js';
//import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Decimal from "decimal.js";
import * as web3 from '@solana/web3.js';
import { styled } from '@mui/material/styles';

import {
    Dialog,
    Button,
    ButtonGroup,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    FormLabel,
    FormHelperText,
    Avatar,
    Grid,
    Paper,
    Skeleton,
    InputLabel,
    Tooltip,
    Typography,
    MenuItem
} from '@mui/material';
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { TOKEN_LIST_URL } from "@jup-ag/core";
import { JupiterProvider, useJupiter } from "@jup-ag/react-hook";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {RegexTextField} from "../../components/Tools/RegexTextField";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {OrcaPoolConfig} from "@orca-so/sdk";
import {ENV, TokenInfo, TokenListProvider} from "@solana/spl-token-registry";

export interface Token {
    chainId: number; // 101,
    address: string; // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: string; // 'USDC',
    name: string; // 'Wrapped USDC',
    decimals: number; // 6,
    logoURI: string; // 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
    tags: string[]; // [ 'stablecoin' ]
}


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};

export default function JupiterSwap(props: any ){
    const connection = useConnection();
    const wallet = useWallet();
    return(<JupiterProvider
        connection={connection.connection}
        cluster={WalletAdapterNetwork.Mainnet}
        userPublicKey={wallet.publicKey}><JupiterForm {...props}/></JupiterProvider>);

}


function JupiterForm(props: any) {
    const [open, setOpen] = React.useState(false);
    const [userTokenBalanceInput, setTokenBalanceInput] = React.useState(0);
    const [convertedAmountValue, setConvertedAmountValue] = React.useState(null);
    const [amounttoswap, setTokensToSwap] = React.useState(null);
    const [swapfrom, setSwapFrom] = React.useState('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const [swapto, setSwapTo] = React.useState('8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA');
    const [tokenMap, setTokenMap] = React.useState<Map<string,TokenInfo>>(undefined);

    const [tokenSwapAvailableBalance, setPortfolioSwapTokenAvailableBalance] = React.useState(0);
    const tokensAvailable = ['GRAPE','SOL','mSOL','USDC','ORCA'];

    useEffect(() => {
        new TokenListProvider().resolve().then((tokens) => {
            const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList()
               .filter(i => tokensAvailable.includes(i.symbol));
            console.log(tokenList)
            const tokenMapValue = tokenList.reduce((map, item) => {
                map.set(item.address, item);
                console.log(map);
                return map;
            }, new Map())
            console.log(tokenMapValue)
            setTokenMap(tokenMapValue);
            console.log('token map set', tokenMap);

        });

    }, [setTokenMap]);

    // useEffect(() => {
    //     console.log("should update dropdowns")
    //     if(tokenMap) {
    //         console.log("check addresses?",Array.from(tokenMap.values()).find(t => t.symbol === props.swapfrom).address, Array.from(tokenMap.values()).find(t => t.symbol === props.swapto).address )
    //         setSwapFrom(Array.from(tokenMap.values()).find(t => t.symbol === props.swapfrom).address)
    //         setSwapTo(Array.from(tokenMap.values()).find(t => t.symbol === props.swapto).address)
    //     }
    // },[swapfrom,swapfrom,tokenMap])


    const jupiter = useJupiter({
        amount: tokenMap?.get(swapfrom) ? amounttoswap * (10 ** tokenMap.get(swapfrom).decimals) : 0, // raw input amount of tokens
        inputMint: new PublicKey(swapfrom),
        outputMint: new PublicKey(swapto),
        slippage: 1, // 1% slippage
        debounceTime: 250, // debounce ms time before refresh
    })
    console.log(jupiter);



    const {
        allTokenMints, // all the token mints that is possible to be input
        routeMap, // routeMap, same as the one in @jup-ag/core
        exchange, // exchange
        refresh, // function to refresh rates
        lastRefreshTimestamp, // timestamp when the data was last returned
        loading, // loading states1
        routes, // all the routes from inputMint to outputMint
        error,
    } = jupiter

    const handleClickOpen = () => {
        setTokenBalanceInput(0);
        setTokensToSwap(0);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleSelectChange = (event: SelectChangeEvent) => {
        setSwapFrom(event.target.value);
        setTokenBalanceInput(0);
        setTokensToSwap(0);
    };

    function HandleSendSubmit(event: any) {
        event.preventDefault();
        console.log(event);
        console.log("send submit");
    }

    React.useEffect(() => {

        // get the balance for this token
        console.log("chaging the amount to swap")
    }, [amounttoswap]);

    return (<div>
        <Button
            variant="outlined"
            //aria-controls={menuId}
            title={`Swap ${tokenMap?.get(swapfrom)?.symbol} > ${tokenMap?.get(swapto)?.symbol}`}
            onClick={handleClickOpen}
            size="small"
            //onClick={isConnected ? handleProfileMenuOpen : handleOpen}
        >
            {tokenMap?.get(swapfrom)?.symbol} <SwapHorizIcon sx={{mr:1,ml:1}} /> {tokenMap?.get(swapto)?.symbol}
        </Button>
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{
                style: {
                    background: 'linear-gradient(to right, #251a3a, #000000)',
                    boxShadow: '3',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderTop: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '20px',
                    padding:'4',
                },
            }}
        >
            <form onSubmit={HandleSendSubmit}>
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Swap
                </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={6}>
                                <FormControl>
                                    <InputLabel id="from-label">From</InputLabel>
                                    <Select
                                        labelId="from-label"
                                        id="from-select-dropdown"
                                        fullWidth
                                        value={swapfrom}
                                        onChange={handleSelectChange}
                                        label="From"
                                    >
                                        {tokenMap && Array.from(tokenMap.values()).map(v =>
                                            v.symbol !== 'GRAPE' && (<MenuItem key={v.address} value={v.address}>{v.symbol}</MenuItem>)
                                        )}
                                        {/*<MenuItem value="USDC">USDC</MenuItem>*/}
                                        {/*<MenuItem value="SOL">SOL</MenuItem>*/}
                                        {/*<MenuItem value="ORCA">ORCA</MenuItem>*/}
                                        {/*<MenuItem value="mSOL">mSOL</MenuItem>*/}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <RegexTextField
                                    regex={/[^0-9]+\.?[^0-9]/gi}
                                    autoFocus
                                    autoComplete='off'
                                    margin="dense"
                                    id="swap-token-amount"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={userTokenBalanceInput || 0}
                                    onChange={(e: any) => {
                                        let val = e.target.value.replace(/^0+/, '');
                                        setTokensToSwap(val)
                                        setTokenBalanceInput(val)
                                    }
                                    }
                                    inputProps={{
                                        style: {
                                            textAlign:'right',
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={2}>

                            </Grid>
                            <Grid item xs={10}
                                  sx={{textAlign:'right'}}
                            >
                                <Typography
                                    variant="caption"
                                >
                                    Balance: {tokenSwapAvailableBalance} {tokenMap?.get(swapfrom)?.symbol}
                                    <ButtonGroup variant="text" size="small" aria-label="outlined primary button group" sx={{ml:1}}>
                                        <Button
                                            onClick={() => {
                                                setTokensToSwap(tokenSwapAvailableBalance);
                                                setTokenBalanceInput(tokenSwapAvailableBalance);
                                            }}
                                        >
                                            Max
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setTokensToSwap(+tokenSwapAvailableBalance/2);
                                                setTokenBalanceInput(+tokenSwapAvailableBalance/2);
                                            }}
                                        >
                                            Half
                                        </Button>
                                    </ButtonGroup>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={6}>
                                <FormControl>
                                    <InputLabel id="to-label">To</InputLabel>
                                    <Select
                                        labelId="to-label"
                                        id="to-select-dropdown"
                                        fullWidth
                                        value={swapto}
                                        label="To"
                                        disabled
                                        defaultValue="Disabled"
                                    >
                                        <MenuItem value={tokenMap?.get(swapto)?.address}>{tokenMap?.get(swapto)?.symbol}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    id="swap-result"
                                    fullWidth
                                    autoComplete="off"
                                    value={convertedAmountValue}
                                    type="number"
                                    variant="outlined"
                                    disabled
                                    defaultValue="Disabled"
                                    InputProps={{
                                        inputProps: {
                                            style: {
                                                textAlign:'right'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    fullWidth
                    type="submit"
                    variant="outlined"
                    title="Swap"
                    // disabled={userTokenBalanceInput > tokenSwapAvailableBalance}
                    sx={{
                        margin:1
                    }}>
                    Swap
                </Button>
            </DialogActions>
        </form>
        </BootstrapDialog>

    </div>)
}
