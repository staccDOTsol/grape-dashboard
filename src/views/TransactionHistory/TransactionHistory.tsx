import React, { FC, useCallback } from 'react';
import { styled } from '@mui/material/styles';

import {
  Dialog,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { useSession } from "../../contexts/session";
import { TokenAmount } from '../../utils/token/safe-math';
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { MakeLinkableAddress, ValidateAddress, trimAddress } from '../../components/Tools/WalletAddress';

import ReceiptIcon from '@mui/icons-material/Receipt';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { web3 } from '@project-serum/anchor';

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

function formatBlockTime(date: string, epoch: boolean, time: boolean){
  // TODO: make a clickable date to change from epoch, to time from, to UTC, to local date

  let date_str = new Date(date).toLocaleDateString(); //.toUTCString();
  if (time)
      date_str = new Date(date).toLocaleString();
  if (epoch){
      date_str = new Date(+date * 1000).toLocaleDateString(); //.toUTCString();
      if (time)
          date_str = new Date(+date * 1000).toLocaleString(); //.toUTCString();
  }
  return (
      <>{date_str}</>
  );
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

export default function TransactionHistory(props: any) {
    const [mint, setMint] = React.useState(props.mint);
    const [mintdecimals, setMintDecimals] = React.useState(props.decimals);
    const [open, setOpen] = React.useState(false);
    const [publicKey, setPublicKey] = React.useState(props.publicKey);
    const [address, setAddress] = React.useState(props.address);
    const [transactionHistory, setTransactionHistory] = React.useState(null);
    const [transactionArray, setTransactionArray] = React.useState(null);
    const [transactionHistoryDetails, setTransactionHistoryDetails] = React.useState(null);
    const [transactionRecentHistory, setTransactionRecentHistory] = React.useState(null);
    const { session, setSession } = useSession();

    const { connection } = useConnection();

    const handleClickOpen = () => {
        setOpen(true);
        fetchTransactionHistoryData();
    };
    const handleClose = () => {
        setOpen(false);
    };

    const fetchTransactionHistoryData = async () => {
      //console.log("ADDRESS: "+address);
      const transaction = await connection.getSignaturesForAddress(new PublicKey(address));
      //console.log("RESPONSE: "+JSON.stringify(transaction));

      let tarray: any[] = [];
      let tmemo: any[] = [];
      let ttime: any[] = [];
      let x = 0;
      for (var value of transaction){
        if (x<100){
          tarray.push(transaction[x].signature);
          tmemo.push(transaction[x].memo);
          ttime.push(transaction[x].blockTime);
        }
        x++;
      }

      setTransactionHistory(transaction);

      const transactionDetails = await connection.getParsedTransactions(tarray);
      //setTransactionHistoryDetails(transactionDetails);

      let txObject = {
        transaction:transaction,
        details: transactionDetails
      }

      setTransactionRecentHistory(txObject);

      let arrtransactional: any[] = [];

      let pos = 0;
      for (var tvalue of transactionDetails){
        //console.log("value: "+JSON.stringify(tvalue));
        // loop instructions
        
        let ipos = 0;

        for (var ivalue of tvalue.transaction.message.instructions){
          console.log("inner value: "+JSON.stringify(ivalue));
          let ival_str = JSON.stringify(ivalue);
          let ival_json = JSON.parse(ival_str);
          if (ipos === 0){
          //for (var xvalue of ivalue){
            if (ival_json?.parsed?.info?.amount){
              if (ival_json.parsed.info.authority === session.publicKey){
                console.log("amount: " + ival_json.parsed.info.amount);
                console.log("sender: " + ival_json.parsed.info.authority);
                console.log("destination: " + ival_json.parsed.info.destination);
                console.log("type: " + ival_json.parsed.type);

                arrtransactional.push({
                  signature:tarray[ipos],
                  transaction:ival_json?.parsed?.info,
                  memo:tmemo[ipos],
                  time:ttime[ipos],
                });
              }

            }
          }
          ipos++;
        }
      }

      setTransactionArray(arrtransactional);
      
    }
    /*
    React.useEffect(() => { 
      if (!transactionHistory){
        fetchTransactionHistoryData();
      }
    }, [address]);
    */
    return (
      <React.Fragment>
            <Button
                variant="outlined" 
                //aria-controls={menuId}
                title={`Transaction History`}
                onClick={handleClickOpen}
                size="small"
                sx={{ml:1}}
                >
                <ReceiptIcon />
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
                        padding:'4'
                        },
                    }}
            >
              <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                Transaction History
              </BootstrapDialogTitle>
              <DialogContent dividers>
                <TableContainer component={Paper} 
                  sx={{
                      background: 'rgba(255,255,255,0.015)',
                      boxShadow: 3,
                      borderRadius: '20px'
                  }}
                  >
                  <Table sx={{ minWidth: 400 }} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Signature</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Destination</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell align="right">Memo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/*
                      {transactionArray ? transactionArray.map((item: any) => (
                        <TableRow
                          key={1}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">  
                            <MakeLinkableAddress addr={item.signature} trim={5} hasextlink={true} hascopy={false} fontsize={14} />
                          </TableCell>
                          <TableCell align="right">
                            {item.transaction.amount && item.transaction.amount > 0 &&
                            <>
                              {parseFloat(new TokenAmount(item.transaction.amount, mintdecimals).format())}
                            </>
                            }
                          </TableCell>
                          <TableCell align="right">
                            <MakeLinkableAddress addr={item.transaction.destination} trim={5} hasextlink={true} hascopy={false} fontsize={14} />
                          </TableCell>
                          <TableCell align="right">
                            <small>{formatBlockTime(item.time, true, true)}</small>
                          </TableCell>
                          <TableCell align="right">
                            {item.memo}
                          </TableCell>
                        </TableRow>
                        ))
                        */}

                      {transactionHistory ? transactionHistory.map((item: any) => (
                        <TableRow
                        key={1}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">  
                          <MakeLinkableAddress addr={item.signature} trim={5} hasextlink={true} hascopy={false} fontsize={14} />
                        </TableCell>
                        <TableCell align="center" colSpan={2}>
                          (coming soon)
                        </TableCell>
                        <TableCell align="right">
                          <small>{formatBlockTime(item.blockTime, true, true)}</small>
                        </TableCell>
                        <TableCell align="right">
                          {item.memo}
                        </TableCell>
                      </TableRow>
                      ))
                      
                      
                        :
                        <React.Fragment>
                            <TableRow>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                                <TableCell><Skeleton/></TableCell>
                            </TableRow>
                        </React.Fragment>
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
            </BootstrapDialog>
      </React.Fragment>
    );
}