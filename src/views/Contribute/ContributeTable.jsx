import * as React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, styled, alpha, useTheme } from '@mui/material/styles';

import {
    Grid,
    Typography,
    Collapse,
    Button,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableContainer,
    TableRow,
    TableFooter,
    TablePagination,
    Paper,
    Box,
    Avatar,
    AvatarGroup,
} from '@mui/material';

import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import HelpIcon from '@mui/icons-material/Help';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TableSortLabel from '@mui/material/TableSortLabel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import SendToken from '../SendToken/SendToken';
import TopHolders from '../TopHolders/TopHolders';
import { MakeLinkableAddress, ValidateAddress } from '../../components/Tools/WalletAddress'; // global key handling
import { PretifyCommaNumber } from '../../components/Tools/PretifyCommaNumber';

const StyledTable = styled(Table)(({ theme }) => ({
    '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
}));

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
    
    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                ) : (
                    <KeyboardArrowLeft />
                )}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                ) : (
                    <KeyboardArrowRight />
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
  }
  
  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };

function trimAddress(addr) {
    if (!addr) return addr;
    let start = addr.substring(0, 8);
    let end = addr.substring(addr.length - 4);
    return `${start}...${end}`;
}

const FarmStake = (props) => {
    const{ stake } = props;
    
    let stakeList = '';

    try{

        return(
            <Grid container direction="row" alignItems="center">
                <Grid item>
                    <AvatarGroup
                        sx={{ mr:1 }}
                    >
                        {stake.map((farmStake, i) => 
                            <Avatar 
                                component={Paper} 
                                elevation={4}
                                alt={farmStake.name} 
                                src={farmStake.logo}
                                sx={{ width: 28, height: 28, bgcolor: "#222" }}
                            />
                        )}
                    </AvatarGroup>
                </Grid>
                <Grid item>
                    {stake.map((farmStake, i) =>
                        <>
                            {i>0 && ('-')}
                            {farmStake.name}
                        </> 
                    )}
                </Grid>
            </Grid>
        );
    } catch(e){ 
        console.log("ERR: "+e) 
    }
    
    return '<></>';
}

const FarmIcon = (props) => {
    const { farmLogoURI, farmName } = props;

    return (
       <Grid container direction="row" alignItems="center">
           <Grid item>
                <Avatar 
                    component={Paper} 
                    elevation={4}
                    alt="Token" 
                    src={farmLogoURI}
                    sx={{ width: 28, height: 28, bgcolor: "#222" }}
                />
           </Grid>
           <Grid item sx={{ ml: 1 }}>
                {farmName}
           </Grid>
       </Grid>
   );
};

const TokenIcon = (props) => {
    const {tokenInfo, mint} = props;
    const tokenLogo = tokenInfo && tokenInfo.logoURI;
    const tokenName = tokenInfo && tokenInfo.name;

    return (
        <Grid container direction="row" alignItems="center" sx={{ flexWrap:"nowrap!important" }}>
            <Grid item>
                {tokenLogo ? 
                    <Avatar component={Paper} 
                        elevation={4}
                        alt="Token" 
                        src={tokenLogo}
                        sx={{ width: 28, height: 28, bgcolor: "#222" }}
                    /> : <HelpIcon />}
            </Grid>
            <Grid item sx={{ ml: 1 }}>
                {tokenName || (mint && trimAddress(mint)) || ''}
            </Grid>
        </Grid>
    );
};

const TokenFixPrice = (props) => {
    const { tokenFormatValue, defaultFixed } = props;
    try{
        switch (true){
            case (+tokenFormatValue < 0.001):{
                return <PretifyCommaNumber number={tokenFormatValue.toFixed(6)} />
                //return numberWithCommasDecimal(tokenFormatValue.toFixed(6))
            }case (+tokenFormatValue < 0.1):{
                return <PretifyCommaNumber number={tokenFormatValue.toFixed(4)} />
                //return numberWithCommasDecimal(tokenFormatValue.toFixed(4))
            }default:{
                return <PretifyCommaNumber number={tokenFormatValue.toFixed(defaultFixed)} />
                //return numberWithCommasDecimal(tokenFormatValue.toFixed(defaultFixed))
            }
        }
    } catch(e) {
        return tokenFormatValue;
    }
}

function PortfolioRow(props) {
    const { token, index } = props;
    const [open, setOpen] = React.useState(false);
    
    return (
        <React.Fragment>
            <TableRow key={index} sx={{ '& > *': { borderBottom: 'unset' }}}>
                <TableCell align="left" sx={{borderBottom:"none"}}>
                    <TokenIcon tokenInfo={token.tokenInfo} mint={token.mint} />
                </TableCell>
                <TableCell align="right" sx={{borderBottom:"none"}}><TokenFixPrice tokenFormatValue={token.balance} defaultFixed={3} /></TableCell>
                <TableCell align="right" sx={{borderBottom:"none", flexWrap:"nowrap!important"}}>
                    {token.usd_24h_change ?
                        <>
                        {token.usd_24h_change < 0 ?
                            <Typography variant="caption" sx={{color:"#f00"}}>
                                <Grid container direction="row" alignItems="center" sx={{ flexWrap:"nowrap!important" }}>
                                    <Grid item>
                                        {token.usd_24h_change.toFixed(2)}%
                                    </Grid>
                                    <Grid item>
                                        <ArrowDownwardIcon fontSize="0.75rem" />
                                    </Grid>
                                </Grid>
                            </Typography>
                        :
                            <Typography variant="caption" sx={{color:"#aaaaaa"}}>
                                <Grid container direction="row" alignItems="center" sx={{ flexWrap:"nowrap!important" }}>
                                    <Grid item>
                                        {token.usd_24h_change.toFixed(2)}%
                                    </Grid>
                                    <Grid item>
                                        <ArrowUpwardIcon fontSize="0.75rem" />
                                    </Grid>
                                </Grid>
                            </Typography>
                        }
                        </>
                    :
                        <>
                            -
                        </>
                    }
                </TableCell>
                <TableCell align="right" sx={{borderBottom:"none"}}>
                    <Typography variant="caption" sx={{color:"#aaaaaa"}}>$</Typography><TokenFixPrice tokenFormatValue={token.price} defaultFixed={2} />
                </TableCell>
                <TableCell align="right" sx={{borderBottom:"none"}}><Typography variant="caption" sx={{color:"#aaaaaa"}}>$</Typography><TokenFixPrice tokenFormatValue={token.value} defaultFixed={2} /></TableCell>
                <TableCell>
                    <SendToken mint={token.mint} name={token.tokenInfo.name} logoURI={token.tokenInfo.logoURI} balance={token.balance} conversionrate={token.value/token.balance} showTokenName={false} sendType={1} />
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export const ContributeTableView = (props) => {
    const balances = props.balances || [];
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - balances.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    let portfolioTableCols = 7;
    
    return (
        <React.Fragment>
            <>
                <TableContainer>
                    <StyledTable sx={{ minWidth: 500 }} size="small" aria-label="Portfolio Table">
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography variant="caption">Asset</Typography></TableCell>
                                <TableCell align="right"><Typography variant="caption">Balance</Typography></TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right"><Typography variant="caption">Price</Typography></TableCell> 
                                <TableCell align="right"><Typography variant="caption">Value</Typography></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rowsPerPage > 0
                                ? balances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : balances
                            ).map((token, index) => {
                                return (
                                    <> 
                                        <PortfolioRow token={token} index={index} />
                                    </>
                                )
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={4} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                        <TableRow>
                            <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={portfolioTableCols}
                            count={balances.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                'aria-label': 'rows per page',
                                },
                                native: true,
                            }}
                            //onChangePage={handleChangePage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                        </TableFooter>
                    </StyledTable>
                </TableContainer>
            </>
        </React.Fragment>
    );
};

export default ContributeTableView;