import React, { FC, useCallback, useMemo, ReactElement } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

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

import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import TelegramIcon from '@mui/icons-material/Telegram';
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

export interface TelegramDialogProps extends Omit<DialogProps, 'title' | 'open'> {
  title?: ReactElement;
}

export function TelegramBoardingDialog(props:any){
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
      
      <Tooltip title={`Link Telegram`}><Button 
        //disabled={!publicKey && !wallet}
        disabled={true} //{!publicKey}
        //disabled={!session.publicKey}
        color="primary" size="small" variant="contained" onClick={handleClickOpenDialog}><LinkIcon sx={{mr:1}}/> Connect Telegram</Button>
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
                  <TelegramIcon  sx={{mr:1}} />
                </Grid>
                <Grid item>Register Wallet with your Telegram Account
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

export const TelegramSettings: FC = (props: any) => {
  const { session, setSession } = useSession();
  const { publicKey, wallet, disconnect, sendTransaction, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();
  const [newTelegramRegistration, setNewTelegramRegistration] = React.useState(null);
  const [telegramRegistration, setTelegramRegistry] = React.useState(null);
  const [telegramRegistryKey, setTelegramRegistryKey] = React.useState(null);
  const [loadingTelegram, setLoadingRPC] = React.useState(false);
  const [telegramOnChainRegistration, setTelegramOnChainRegistry] = React.useState(null);
  //const wallet = props.wallet;
  const endpoint = props.endpoint;
  const { enqueueSnackbar } = useSnackbar();

  async function deregisterTwitterWithConnectedWallet(){
    
    if ((wallet)&&(telegramRegistryKey)){
      setLoadingRPC(true);
      /*
      const instruction = await deleteTelegramRegistry(telegramRegistration, publicKey);
      
      enqueueSnackbar(`Attempting Transaction...`,{ variant: 'success' });
      const transaction = new Transaction().add(...instruction);
      transaction.recentBlockhash = (
          await connection.getRecentBlockhash("finalized")
      ).blockhash;
      //console.log("Transaction: "+JSON.stringify(transaction));
      transaction.feePayer = publicKey;
      try{
        enqueueSnackbar(`Signing Transaction...`,{ variant: 'success' });
        
        const signature = await sendTransaction(transaction, connection)
        //const signature = await signTransaction(transaction)
        .catch((error: any)=>{
          setLoadingRPC(false);
          throw new Error('Request was not completed! '+error);
        });
        if (!signature){
          setLoadingRPC(false);
          throw new Error('Invalid signature!');
        }else{
          await connection.confirmTransaction(signature, 'processed');
          setTelegramOnChainRegistry(null);
          // check if actually removed...
          const timeout = setTimeout(() => {
            enqueueSnackbar(`Registry deleted...`,{ variant: 'success' });
            checkTelegramRegistration();
            setLoadingRPC(false);
          }, 4000); // added a small delay
          return true;
        }
        return false;
      } catch(e){
        console.log("ERR: "+e);
        setLoadingRPC(false);
        checkTelegramRegistration();
        return false;
      }
      */
    }

  }

  const unlinkTelegram = async () => {
    //await User.updateUser(session, null);
    if (telegramRegistration){
      setLoadingRPC(true);
      console.log("Deleting registry: "+telegramRegistration+" / "+publicKey);
      //deregisterTelegramWithConnectedWallet();
    }
  };

  async function checkTelegramRegistration(){
    setLoadingRPC(true);
    /*
    getTwitterHandleandRegistryKeyViaFilters(connection, publicKey)
    .then(function(response) {
      if (response){   
        setTwitterRegistry(response[0]);
        setTwitterRegistryKey(response[1]);
        console.log("Found: "+response[0]+" with "+response[1]);
      }
      setLoadingRPC(false);
    })
    .catch(function (error){
      if ("Error: Registry not found."){
        setTwitterRegistry(null);
        setLoadingRPC(false);
      }
      console.log("PROMISE ERR DNS ("+publicKey+"): "+error)
    });
    */
  }

  React.useEffect(() => { 
    /*
    if (publicKey && connection){ // use rpc node filtering...
      if (publicKey.toString() == session.publicKey){
        checkTelegramRegistration();
      }
    }
    */
  }, [publicKey]);

  React.useEffect(() => { 
    //if (newTelegramRegistration){
    //  checkTelegramRegistration();
    //}
  }, [newTelegramRegistration]);
  
  return (
        <TableRow key={'telegram'}>
          <TableCell component="th" scope="row">
            <Grid container direction="row" alignItems="center">
              <Grid item>
                <TelegramIcon fontSize="large" />
              </Grid>
              <Grid item sx={{ ml: "20px" }}>
                Telegram
              </Grid>
            </Grid>
          </TableCell>
          <TableCell align="right">
          {loadingTelegram ? 
              <>loading connected account...</>
            :
            <>
              {!telegramRegistration && 
                <i>Not connected</i>
              }{telegramRegistration && 
                <>
                  <MakeLinkableAddress addr={`@${telegramRegistration}`} trim={0} hasextlink={false} hascopy={true} isDNS={true} fontsize={12} />
                </>
              }
            </>
          }
          
          </TableCell>
          <TableCell align="right">
          {loadingTelegram ? 
              <Button color="primary" size="small" variant="outlined" disabled={true}><CircularProgress size={24} /></Button>
            :
            <>
              {!telegramRegistration && 
                <>
                <TelegramBoardingDialog setNewTelegramRegistration={setNewTelegramRegistration} /> 
                </>
              }{telegramRegistration && 
                <Tooltip title={`Remove Telegram Registration`}><Button color="primary" size="small" variant="outlined" onClick={unlinkTelegram}><LinkOffIcon/></Button></Tooltip>
              }
            </>
          }
          </TableCell>
        </TableRow>

  )
}