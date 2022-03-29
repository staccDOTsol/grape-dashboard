// ADD CODE FOR JUPITAR SWAP IMPLEMENTATION
import React, { FC, useCallback } from 'react';
import SwapDialog from "../Swap/SwapDialog";
import { WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, Signer } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
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

export default function JupiterSwap(props: any) {
    const [open, setOpen] = React.useState(false);
    const [userTokenBalanceInput, setTokenBalanceInput] = React.useState(0);
    const [amounttoswap, setTokensToSwap] = React.useState(null);
    const [swapfrom, setSwapFrom] = React.useState(props.swapfrom);
    const [swapto, setSwapTo] = React.useState(props.swapto);
    const [tokenmap, setTokenMap] = React.useState(props.tokenmap);

    const handleClickOpen = () => {
        setTokenBalanceInput(0);
        setTokensToSwap(0);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (      <div>
        <Button
            variant="outlined"
            //aria-controls={menuId}
            title={`Swap ${swapfrom} > ${swapto}`}
            onClick={handleClickOpen}
            size="small"
            //onClick={isConnected ? handleProfileMenuOpen : handleOpen}
        >
            {swapfrom} <SwapHorizIcon sx={{mr:1,ml:1}} /> {swapto}
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
        ><p>Some test content here.</p></BootstrapDialog>

    </div>)
}
