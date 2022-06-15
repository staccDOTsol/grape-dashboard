import React, { FC, useCallback, useMemo, ReactElement } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
//import Discord, { Message } from 'discord.js'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Button,
  Paper,
  TableRow,
  TableCell,
  Typography,
  TextField,
  Tooltip,
  Dialog,
  DialogProps,
  IconButton,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import{
  styled, createTheme
} from '@mui/material/styles';

import MuiAlert, { AlertProps } from '@mui/material/Alert';

import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { sign } from 'tweetnacl';

import LanguageIcon from '@mui/icons-material/Language';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useSnackbar } from 'notistack';
import { useConnection, ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';

import { Connection, PublicKey, Keypair, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';

import { useSession } from "../../contexts/session";
import { MakeLinkableAddress } from '../../components/Tools/WalletAddress'; // global key handling

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
  ) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
      width: theme.spacing(60),
      margin: 0,
  },
  '& .MuiDialogTitle-root': {
      //backgroundColor: theme.palette.primary.main,
      //backgroundColor: '#000000',  /* fallback for old browsers */
      backgroundColor: 'rgb(0 0 0 / 50%)',
      '& .MuiTypography-root': {
          display: 'flex',
          justifyContent: 'space-between',
          lineHeight: theme.spacing(5) + 'px',
      },
      '& .MuiIconButton-root': {
          flexShrink: 1,
          padding: theme.spacing(),
          marginRight: theme.spacing(2),
          color: theme.palette.grey[500],
      },
  },
  '& .MuiDialogContent-root': {
      padding: 0,
      '& .MuiCollapse-root': {
          '& .MuiList-root': {
              background: theme.palette.grey[900],
          },
      },
      '& .MuiList-root': {
          background: theme.palette.grey[900],
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

export interface WebsiteDialogProps extends Omit<DialogProps, 'title' | 'open'> {
  title?: ReactElement;
}

export function WebsiteBoardingDialog(props:any){
  const [open_dialog, setOpenPKDialog] = React.useState(false);
  const [open_snackbar, setSnackbarState] = React.useState(false);
  const { publicKey, wallet, connected, disconnect, autoConnect, sendTransaction, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();
  const { enqueueSnackbar } = useSnackbar();
  const onError = useCallback(
    (error: WalletError) => {
        enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
        console.error(error);
    },
    [enqueueSnackbar]
  );

  const handleCopyClick = () => {
    setSnackbarState(true);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
      if (reason === 'clickaway') {
          return;
      }
      setSnackbarState(false);
  };
  
  //const handleClickOpenDialog = () => {
  const handleClickOpenDialog = useCallback(async () => {  
    if (!publicKey) throw new WalletNotConnectedError();
    handleReset();
    setOpenPKDialog(true);
  }, [publicKey, sendTransaction, connection]);
  
  const handleCloseDialog = () => {
      setOpenPKDialog(false);
  };

  const [activeStep, setActiveStep] = React.useState(0);
  
  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <React.Fragment>
      
      <Tooltip title={`Link Website`}><Button 
        //disabled={!publicKey && !wallet}
        disabled={true} //{!publicKey}
        //disabled={!session.publicKey}
        color="primary" size="small" variant="contained" onClick={handleClickOpenDialog}><LinkIcon sx={{mr:1}}/> Connect Website</Button>
      </Tooltip>
        <BootstrapDialog
          open={open_dialog} 
          onClose={handleCloseDialog} 
          //fullWidth={true}
          maxWidth={"lg"}
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
          >
      
          <DialogTitle>
          <Typography variant="h6">
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <LanguageIcon  sx={{mr:1}} />
                </Grid>
                <Grid item>Register Wallet with your Website
                </Grid>
              </Grid>
            </Typography>
          </DialogTitle>
          <DialogContent>
              <Box sx={{ maxWidth: 400, p: 1 }}>
                ... nothing to see here yet ...
              </Box>
          </DialogContent>
      </BootstrapDialog>   
      <Snackbar open={open_snackbar} autoHideDuration={2000} message="Copied">
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Copied!
          </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export const WebsiteSettings: FC = (props: any) => {
  const { session, setSession } = useSession();
  const { publicKey, wallet, disconnect, sendTransaction, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();
  const [newWebsiteRegistration, setNewWebsiteRegistration] = React.useState(null);
  const [websiteRegistration, setWebsiteRegistry] = React.useState(null);
  const [websiteRegistryKey, setWebsiteRegistryKey] = React.useState(null);
  const [loadingWebsite, setLoadingRPC] = React.useState(false);
  const [websiteOnChainRegistration, setWebsiteOnChainRegistry] = React.useState(null);
  //const wallet = props.wallet;
  const endpoint = props.endpoint;
  const { enqueueSnackbar } = useSnackbar();
  
  return (
        <TableRow key={'website'}>
          <TableCell component="th" scope="row">
            <Grid container direction="row" alignItems="center">
              <Grid item>
                <LanguageIcon fontSize="large" />
              </Grid>
              <Grid item sx={{ ml: "20px" }}>
                Website
              </Grid>
            </Grid>
          </TableCell>
          <TableCell align="right">
          {loadingWebsite ? 
              <>loading connected website...</>
            :
            <>
              {!websiteRegistration && 
                <i>Not connected</i>
              }{websiteRegistration && 
                <>
                  <MakeLinkableAddress addr={`@${websiteRegistration}`} trim={0} hasextlink={false} hascopy={true} isDNS={true} fontsize={12} />
                </>
              }
            </>
          }
          
          </TableCell>
          <TableCell align="right">
          {loadingWebsite ? 
              <Button color="primary" size="small" variant="outlined" disabled={true}><CircularProgress size={24} /></Button>
            :
            <>
              {!websiteRegistration && 
                <>
                <WebsiteBoardingDialog setNewWebsiteRegistration={setNewWebsiteRegistration} /> 
                </>
              }{websiteRegistration && 
                <Tooltip title={`Remove Website Registration`}><Button color="primary" size="small" variant="outlined" onClick={null}><LinkOffIcon/></Button></Tooltip>
              }
            </>
          }
          </TableCell>
        </TableRow>

  )
}