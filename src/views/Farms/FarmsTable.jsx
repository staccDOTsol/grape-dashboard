import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';

import {
    Grid,
    Typography,
    Collapse,
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

import {formatAmount, getFormattedNumberToLocale} from '../Meanfi/helpers/ui';

import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
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
            <Grid container direction="row" alignItems="center" sx={{ flexWrap:"nowrap!important" }}>
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
       <Grid container direction="row" alignItems="center" sx={{ flexWrap:"nowrap!important" }}>
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

export const FarmsTableView = (props) => {
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

    let portfolioTableCols = 6;
    props.isFarm ?
        portfolioTableCols = 5//3
    :
        portfolioTableCols = 6;

    // When we have rewards add
    //
    //<TableCell align="center">LP</TableCell>
    //<TableCell align="center">Value</TableCell>
    //<TableCell align="right">Pending</TableCell>

    //<TableCell align="right">{token.lpprice && `$${token.lpprice.toFixed(4)}`}</TableCell>
    //<TableCell align="right">{token.value && `$${token.value.toFixed(6)}`}</TableCell>
    //<TableCell align="right">{token.pendingReward}</TableCell>

    return (
        <React.Fragment>
            
                <TableContainer component={Paper} sx={{background:'none'}}>
                    <StyledTable sx={{ minWidth: 500 }} size="small" aria-label="Farms Table">
                        <TableHead>
                            {props.isFarm &&
                                <TableRow>
                                    <TableCell><Typography variant="caption">Platform</Typography></TableCell>
                                    <TableCell><Typography variant="caption">Asset</Typography></TableCell>
                                    <TableCell align="right"><Typography variant="caption">Staked LP</Typography></TableCell>
                                    <TableCell align="right"><Typography variant="caption">APR</Typography></TableCell>
                                    <TableCell align="right"><Typography variant="caption">Value</Typography></TableCell>
                                </TableRow>
                            }
                        </TableHead>
                        <TableBody>
                            {(rowsPerPage > 0
                                ? balances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : balances
                            ).map((token, index) => {
                                return props.isFarm && 
                                    <React.Fragment>
                                        <TableRow>
                                            <TableCell style={{ verticalAlign: 'middle' }}>
                                                <FarmIcon farmLogoURI={token.farmLogoURI} farmName={token.farmName} />
                                            </TableCell>
                                            <TableCell align="center" style={{ verticalAlign: 'middle' }}>
                                                <FarmStake stake={token.farmInfo} />
                                            </TableCell>
                                            <TableCell align="right">{(getFormattedNumberToLocale(formatAmount(token.balance),0))}</TableCell>
                                            <TableCell align="right"><TokenFixPrice tokenFormatValue={token.apr} defaultFixed={2} />%</TableCell>
                                            <TableCell align="right"><Typography variant="caption" sx={{color:"#aaaaaa"}}>$</Typography><TokenFixPrice tokenFormatValue={token.value} defaultFixed={2} /></TableCell>
                                        </TableRow> 
                                    </React.Fragment>
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
                
        </React.Fragment>
    );
};

export default FarmsTableView;