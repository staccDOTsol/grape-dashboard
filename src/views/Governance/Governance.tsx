import { getRealms, getAllProposals, getAllTokenOwnerRecords, getVoteRecordsByVoter, getTokenOwnerRecordForRealm, getTokenOwnerRecordsByOwner, getGovernanceAccounts, pubkeyFilter, TokenOwnerRecord } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  Avatar,
  Skeleton,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  Collapse
} from '@mui/material/';

import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { PretifyCommaNumber } from '../../components/Tools/PretifyCommaNumber';
import { REALM_ID, GOVERNING_TOKEN, GOVERNANCE_PROGRAM_ID } from '../../components/Tools/constants';
import { token } from '@project-serum/anchor/dist/cjs/utils';

const StyledTable = styled(Table)(({ theme }) => ({
    '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
}));

function RealmProposals(props:any) {
    const [loading, setLoading] = React.useState(false);
    const [proposals, setProposals] = React.useState(null);
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const realm = props.realm;

    const getProposals = async () => {
        if (!loading){
            setLoading(true);
            try{
            
                const programId = new PublicKey(GOVERNANCE_PROGRAM_ID);
                const gprops = await getAllProposals(connection, programId, realm);
                setProposals(gprops);
                console.log("Proposals ("+realm+"): "+JSON.stringify(gprops));
            }catch(e){console.log("ERR: "+e)}
        }
        setLoading(false);
    }

    React.useEffect(() => { 
        if (publicKey && !loading && realm)
            getProposals();
    }, [realm]);

    return (
        <>
            {proposals && (proposals).map((item: any, index:number) => (
                <>
                    {JSON.stringify(item)}
                </>
            ))}
        </>
    );
        /*
    if(loading){
        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <Paper className="grape-paper-background">
                        <Paper
                        className="grape-paper"
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        >
                            <Box sx={{ p:1, width: "100%" }}>
                                <Skeleton />
                            </Box>
                        </Paper>
                    </Paper>
                </Grid>
            </React.Fragment>
        )
    } else{
        if (proposals){
            return (
                <>
                    {JSON.stringify(proposals)}
                </>
            );
        }
    }
*/
}

export function GovernanceView(props: any) {
    const [loading, setLoading] = React.useState(false);
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [realms, setRealms] = React.useState(null);
    const [voteRecords, setVoteRecords] = React.useState(null);
    const [tokenOwnerRecords, setOwnerRecords] = React.useState(null);
    const [tokenOwnerRecordsByOwner, setOwnerRecordsByOwner] = React.useState(null);

    const getGovernance = async () => {
        if (!loading){
            setLoading(true);
            try{
                const programId = new PublicKey(GOVERNANCE_PROGRAM_ID);
                
                const realmId = new PublicKey(REALM_ID);
                const governingTokenMint = new PublicKey(GOVERNING_TOKEN); // Grape Mint
                const governingTokenOwner = publicKey;

                const rlms = await getRealms(connection, programId);
                const uTable = rlms.reduce((acc, it) => (acc[it.pubkey.toBase58()] = it, acc), {})
                setRealms(uTable);

                const ownerRecordsbyOwner = await getTokenOwnerRecordsByOwner(connection, programId, governingTokenOwner);
                setOwnerRecordsByOwner(ownerRecordsbyOwner);
            
            }catch(e){console.log("ERR: "+e)}
        } else{

        }
        setLoading(false);
    }

    function GovernanceRow(props: any) {
        const item = props.item;
        const index = props.index;
        const realm = props.realm;
        const tokenOwnerRecord = props.tokenOwnerRecord;
        const [open, setOpen] = React.useState(false);
        
        return (
            <React.Fragment>
                    <TableRow key={index} sx={{borderBottom:"none"}}>
                        
                        <TableCell style={{ verticalAlign: 'middle' }}>
                            <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => setOpen(!open)}
                            >
                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                        </TableCell>
                        <TableCell align='left' style={{ verticalAlign: 'middle' }}>  
                            {tokenOwnerRecordsByOwner[index].account.governingTokenMint.toBase58() === GOVERNING_TOKEN ? (
                                <Grid container direction="row" alignItems="center" sx={{ }}>
                                    <Grid item>
                                        <Avatar 
                                            component={Paper} 
                                            elevation={4}
                                            alt="Token" 
                                            src={'https://lh3.googleusercontent.com/y7Wsemw9UVBc9dtjtRfVilnS1cgpDt356PPAjne5NvMXIwWz9_x7WKMPH99teyv8vXDmpZinsJdgiFQ16_OAda1dNcsUxlpw9DyMkUk=s0'}
                                            sx={{ width: 28, height: 28, bgcolor: "#222" }}
                                        />
                                    </Grid>
                                    <Grid item sx={{ ml: 1 }}>
                                        {realm.account?.name || tokenOwnerRecordsByOwner[index].account.governingTokenMint.toBase58()}
                                    </Grid>
                                </Grid>
                            ):(
                                <Grid container direction="row" alignItems="center" sx={{ }}>
                                    {realm.account?.name || tokenOwnerRecordsByOwner[index].account.governingTokenMint.toBase58()}
                                </Grid>
                            )}
                        </TableCell>
                        <TableCell align="right">{(parseInt(tokenOwnerRecordsByOwner[index].account?.governingTokenDepositAmount, 10))/1000000}</TableCell>
                        <TableCell align="right"><Button href={`https://realms.today/dao/${tokenOwnerRecordsByOwner[index].account.realm.toBase58()}`} target='_blank'><HowToVoteIcon /></Button></TableCell>                        
                    </TableRow>
    
                    <TableRow key={`r-${index}`}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7} align="center">
                            <Collapse in={open} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1 }}>
                                    


                                    {/*
                                    <Typography variant="h6" gutterBottom component="div">
                                        Address
                                    </Typography>
                                    */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>Realm: {tokenOwnerRecord.account.realm.toBase58()}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <RealmProposals realm={tokenOwnerRecord.account.realm} />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Collapse>
                        </TableCell>
                    </TableRow>
            </React.Fragment>
        );
    }
    
    React.useEffect(() => { 
        if (publicKey && !loading)
            getGovernance();
    }, [publicKey]);
    
    if(loading){
        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <Paper className="grape-paper-background">
                        <Paper
                        className="grape-paper"
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        >
                            <Box sx={{ p:1, width: "100%" }}>
                                <Skeleton />
                            </Box>
                        </Paper>
                    </Paper>
                </Grid>
            </React.Fragment>
        )
    } else{
        if (tokenOwnerRecordsByOwner && realms){
            return (
                <React.Fragment>
                    <Grid item xs={12} md={12} lg={12}>
                        <Paper className="grape-paper-background">
                            <Box className="grape-paper">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box className="grape-dashboard-component-header" sx={{ m: 0, position: 'relative' }}>
                                        <Typography gutterBottom variant="h6" component="div" sx={{ m: 0, position: 'relative'}}>
                                        GOVERNANCE
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <TableContainer>
                                    <StyledTable sx={{ minWidth: 500 }} size="small" aria-label="Governance Table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell><Typography variant="caption">Realm</Typography></TableCell>
                                                <TableCell align="right"><Typography variant="caption">Votes</Typography></TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tokenOwnerRecordsByOwner && Object.keys(tokenOwnerRecordsByOwner).map((item: any, index:number) => (
                                                <>
                                                    <GovernanceRow item={item} index={index} realm={realms[tokenOwnerRecordsByOwner[item].account.realm.toBase58()]} tokenOwnerRecord={tokenOwnerRecordsByOwner[item]}/>
                                                </>
                                            ))}
                                        </TableBody>
                                    </StyledTable>
                                </TableContainer>
                                
                            </Box>
                        </Paper>
                    </Grid>
                </React.Fragment>
            );
        }else{
            return (<></>);
        }
        
    }
}