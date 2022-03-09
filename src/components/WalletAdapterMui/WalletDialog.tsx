import {
    Button,
    Collapse,
    Dialog,
    DialogContent,
    DialogProps,
    DialogTitle,
    IconButton,
    List,
    ListItem
} from '@mui/material';

import{
    styled, createTheme
} from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import React, { FC, ReactElement, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useWalletDialog } from './useWalletDialog';
import { WalletListItem } from './WalletListItem';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: theme.spacing(40),
        margin: 0,
    },
    '& .MuiDialogTitle-root': {
        //backgroundColor: theme.palette.primary.main,
        //backgroundColor: '#000000',  /* fallback for old browsers */
        //backgroundColor: 'rgb(0 0 0 / 50%)',
        background: 'linear-gradient(to right, #251a3a, #000000)',
        '& .MuiTypography-root': {
            display: 'flex',
            justifyContent: 'space-between',
            lineHeight: theme.spacing(5) + 'px',
        },
        '& .MuiIconButton-root': {
            flexShrink: 1,
            padding: theme.spacing(),
            marginRight: theme.spacing(-1),
            color: theme.palette.grey[500],
        },
    },
    '& .MuiDialogContent-root': {
        padding: 0,
        '& .MuiCollapse-root': {
            '& .MuiList-root': {
                background: 'rgba(0,0,0,0.5)',
            },
        },
        '& .MuiList-root': {
            background: 'rgba(0,0,0,0.5)',
            padding: 0,
        },
        '& .MuiListItem-root': {
            boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
                boxShadow:
                    'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)' + ', 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.05)',
            },
            padding: 0,
            '& .MuiButton-endIcon': {
                margin: 0,
            },
            '& .MuiButton-root': {
                flexGrow: 1,
                justifyContent: 'space-between',
                padding: theme.spacing(1, 3),
                borderRadius: undefined,
                fontSize: '1rem',
                fontWeight: 400,
            },
            '& .MuiSvgIcon-root': {
                color: theme.palette.grey[500],
            },
        },
    },
}));

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

export interface WalletDialogProps extends Omit<DialogProps, 'title' | 'open'> {
    featuredWallets?: number;
    title?: ReactElement;
}

export const WalletDialog: FC<WalletDialogProps> = ({
    title = 'Select your wallet',
    featuredWallets = 3,
    onClose,
    ...props
}) => {
    const { wallets, select } = useWallet();
    const { open, setOpen } = useWalletDialog();
    const [expanded, setExpanded] = useState(false);

    const [featured, more] = useMemo(
        () => [wallets.slice(0, featuredWallets), wallets.slice(featuredWallets)],
        [wallets, featuredWallets]
    );

    const handleClose = useCallback(
        (event: SyntheticEvent, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (onClose) onClose(event, reason!);
            if (!event.defaultPrevented) setOpen(false);
        },
        [setOpen, onClose]
    );

    const handleWalletClick = useCallback(
        (event: SyntheticEvent, walletName: WalletName) => {
            select(walletName);
            handleClose(event);
        },
        [select, handleClose]
    );

    const handleExpandClick = useCallback(() => setExpanded(!expanded), [setExpanded, expanded]);
    
    return (
        <BootstrapDialog
            open={open} 
            onClose={handleClose} 
            //fullWidth={true}
            maxWidth={"xs"}
            PaperProps={{ 
            style: {
                background: 'linear-gradient(to right, #251a3a, #000000)',
                boxShadow: '3',
                border: '1px solid rgba(255,255,255,0.15)',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '20px',
                padding:'4'
                },
            }}
            {...props}>
            <DialogTitle>
                {title}
                <IconButton 
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }} 
                    onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <List>
                    {featured.map((wallet) => (
                        <WalletListItem
                            key={wallet.name}
                            onClick={(event) => handleWalletClick(event, wallet.name)}
                            wallet={wallet}
                        />
                    ))}
                    {more.length ? (
                        <>
                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                                <List>
                                    {more.map((wallet) => (
                                        <WalletListItem
                                            key={wallet.name}
                                            onClick={(event) => handleWalletClick(event, wallet.name)}
                                            wallet={wallet}
                                        />
                                    ))}
                                </List>
                            </Collapse>
                            <ListItem>
                                <Button onClick={handleExpandClick}>
                                    {expanded ? 'Less' : 'More'} options
                                    {expanded ? <ExpandLess /> : <ExpandMore />}
                                </Button>
                            </ListItem>
                        </>
                    ) : null}
                </List>
            </DialogContent>
        </BootstrapDialog>
    );
};