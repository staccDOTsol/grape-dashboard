import React, { useCallback, useContext, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import {
    Typography,
    Grid,
    Box,
    Paper,
    Avatar,
    Table,
    TableContainer,
    TableCell,
    TableHead,
    TableBody,
    TableRow,
    IconButton,
    TablePagination,
    useTheme,
    CircularProgress,
} from '@mui/material/';
import { Stream, STREAM_STATUS } from "@mean-dao/msp";
import ArrowCircleRightOutlined from '@mui/icons-material/ArrowCircleRightOutlined';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import Jazzicon from 'react-jazzicon'
import { IconMeanfi } from "../../views/Meanfi/icons";
import { formatThousands, getIntervalFromSeconds, makeDecimal, shortenAddress } from "../../views/Meanfi/helpers/ui";
import { useWallet } from "@solana/wallet-adapter-react";
import BN from "bn.js";
import { AppStateContext } from "../../views/Meanfi/contexts/appstate";
import bs58 from "bs58";

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
                aria-label="first page">
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page">
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page">
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
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

export interface MoneyStreamsAccountsTableProps {
    disabled?: boolean;
    refreshMoneyStreams?: () => void;
    setSelectedMoneyStream?: (data: Stream) => void;
}

function MoneyStreamsAccountsTable(props: MoneyStreamsAccountsTableProps) {

    const {
        tokenList,
        streamList,
        loadingStreams,
        loadingStreamActivity,
        getTokenByMintAddress,
    } = useContext(AppStateContext);
    const { publicKey } = useWallet();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const meanToken = useMemo(() => {
        const token = tokenList.find(t => t.symbol === 'MEAN');
        console.log('token:', token);
        return token || undefined;
    }, [tokenList]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isInboundStream = useCallback((item: Stream): boolean => {
        if (item && publicKey) {
            return item.beneficiary === publicKey.toBase58() ? true : false;
        }
        return false;
    }, [publicKey]);

    const getStreamStatus = useCallback((item: Stream) => {
        switch (item.status) {
            case STREAM_STATUS.Schedule:
                return 'SCHEDULED';
            case STREAM_STATUS.Paused:
                return 'STOPPED';
            default:
                return 'RUNNING';
        }
    }, []);

    const getTokenSymbolByAddress = useCallback((address: string, includeSpace = true, includeName = false) => {
        let symbolStr = includeSpace ? ' ' : '';
        const token = getTokenByMintAddress(address)
        symbolStr += token && token.name !== 'Unknown'
            ? includeName
                ? `${token.symbol} (${token.name})`
                : `${token.symbol}`
            : `[${shortenAddress(address as string, 6)}]`;
        return symbolStr;
    }, [getTokenByMintAddress]);

    const getStreamDescription = (item: Stream): string => {
        let title = '';
        if (item) {
            const isInbound = isInboundStream(item);
            if (item.name) {
                return `${item.name}`;
            }
            if (isInbound) {
                if (item.status === STREAM_STATUS.Schedule) {
                    title = `Scheduled stream from (${shortenAddress(`${item.treasurer}`)})`;
                } else if (item.status === STREAM_STATUS.Paused) {
                    title = `Paused stream from (${shortenAddress(`${item.treasurer}`)})`;
                } else {
                    title = `Receiving from (${shortenAddress(`${item.treasurer}`)})`;
                }
            } else {
                if (item.status === STREAM_STATUS.Schedule) {
                    title = `Scheduled stream to (${shortenAddress(`${item.beneficiary}`)})`;
                } else if (item.status === STREAM_STATUS.Paused) {
                    title = `Paused stream to (${shortenAddress(`${item.beneficiary}`)})`;
                } else {
                    title = `Sending to (${shortenAddress(`${item.beneficiary}`)})`;
                }
            }
        }

        return title;
    }

    return (
        <React.Fragment>
                {/* Heading */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box
                        className="grape-dashboard-component-header"
                        sx={{ m: 0, position: "relative" }}>
                        <Typography
                            gutterBottom
                            variant="h6"
                            component="div"
                            sx={{ m: 0, position: "relative" }}>
                            MONEY STREAMS
                        </Typography>
                    </Box>
                    <Box sx={{ mr: 1 }}>
                        <IconButton
                            color="primary"
                            aria-label="Refresh Stream List"
                            component="span"
                            disabled={loadingStreams || loadingStreamActivity}
                            onClick={props.refreshMoneyStreams}>
                            <AutorenewOutlinedIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Paper elevation={0} className={`money-streams-widget-content ${loadingStreams ? 'click-disabled' : ''}`} sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 660, backgroundColor: 'inherit' }}>
                        <Table stickyHeader aria-label="Money Streams" sx={{ backgroundColor: 'inherit' }}>
                            <TableHead sx={{ backgroundColor: 'inherit' }}>
                                <TableRow sx={{ backgroundColor: 'inherit' }}>
                                    <TableCell sx={{ minWidth: '180px', backgroundColor: 'inherit' }}>
                                        <Typography variant="caption">Platform</Typography>
                                    </TableCell>
                                    <TableCell sx={{ minWidth: '100px', backgroundColor: 'inherit' }}>
                                        <Typography variant="caption">Asset</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: '158px', backgroundColor: 'inherit' }}>
                                        <Typography variant="caption" sx={{ marginRight: '30px' }}>Status</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: '146px', backgroundColor: 'inherit' }}>
                                        <Typography variant="caption">Funds left</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: '146px', backgroundColor: 'inherit' }}>
                                        <Typography variant="caption">Payment Rate</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ minWidth: '146px', backgroundColor: 'inherit' }}>
                                        <Typography variant="caption">Available Funds</Typography>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: 'inherit' }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {streamList && streamList.length > 0 ? (
                                    <>
                                        {streamList.map((item: Stream, index: number) => {
                                            const fromItemIndex = page * rowsPerPage;
                                            const toItemIndex = fromItemIndex + rowsPerPage;
                                            if (index < fromItemIndex || index >= toItemIndex) { return null; }
                                            const associatedToken = item.associatedToken ? getTokenByMintAddress(item.associatedToken as string) : undefined;
                                            return (
                                                <TableRow key={`${index}`} id={`${item.id}`}>
                                                    {/* Platform */}
                                                    <TableCell style={{ verticalAlign: "middle" }}>
                                                        <Grid container direction="row" alignItems="center" sx={{}} wrap="nowrap">
                                                            <Grid item>
                                                                {meanToken ? (
                                                                    <Avatar
                                                                        component={Paper}
                                                                        elevation={4}
                                                                        alt="Token"
                                                                        src={meanToken.logoURI}
                                                                        sx={{ width: 28, height: 28, bgcolor: "#222" }}
                                                                    />
                                                                ) : (
                                                                    <IconMeanfi style={{display: "flex", width: 24, height: 24, alignItems: "center"}} />
                                                                )}
                                                            </Grid>
                                                            <Grid item xs zeroMinWidth sx={{ ml: 1 }}>
                                                                <Typography noWrap>{getStreamDescription(item)}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </TableCell>
                                                    {/* Asset */}
                                                    <TableCell style={{ verticalAlign: "middle" }}>
                                                        <Grid container direction="row" alignItems="center" sx={{}} wrap="nowrap">
                                                            <Grid item>
                                                                {associatedToken && associatedToken.logoURI ? (
                                                                    <Avatar
                                                                        component={Paper}
                                                                        elevation={4}
                                                                        alt={associatedToken.name}
                                                                        src={associatedToken.logoURI}
                                                                        sx={{ width: 28, height: 28, bgcolor: "#222" }}
                                                                    />
                                                                ) : (
                                                                    <Box sx={{ height: 28 }}>
                                                                        <Jazzicon
                                                                            diameter={28}
                                                                            seed={parseInt(bs58.decode(item.associatedToken as string).toString("hex").slice(5, 15), 16)} />
                                                                    </Box>
                                                                )}
                                                            </Grid>
                                                            <Grid item sx={{ ml: 1 }}>
                                                                {getTokenSymbolByAddress(item.associatedToken as string)}
                                                            </Grid>
                                                        </Grid>
                                                    </TableCell>
                                                    {/* Status */}
                                                    <TableCell align="right" valign="middle">
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'right', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                <Box className="pill medium">{getStreamStatus(item)}</Box>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pl: 1 }}>
                                                                {isInboundStream(item) ? (
                                                                    <ArrowDownwardOutlinedIcon fontSize="small" className="stream-type-incoming" />
                                                                ) : (
                                                                    <ArrowUpwardOutlinedIcon fontSize="small" className="stream-type-outgoing" />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    {/* Funds left */}
                                                    <TableCell align="right">
                                                        {
                                                            formatThousands(
                                                                makeDecimal(
                                                                    new BN(item.fundsLeftInStream),
                                                                    associatedToken ? associatedToken.decimals : 6
                                                                ),
                                                                associatedToken ? associatedToken.decimals : 6
                                                            )
                                                        }
                                                    </TableCell>
                                                    {/* Payment Rate */}
                                                    <TableCell align="right">
                                                        {
                                                            formatThousands(
                                                                makeDecimal(
                                                                    new BN(item.rateAmount),
                                                                    associatedToken ? associatedToken.decimals : 6
                                                                ),
                                                                associatedToken ? associatedToken.decimals : 6
                                                            )
                                                        }
                                                        {getIntervalFromSeconds(item.rateIntervalInSeconds as number, true)}
                                                    </TableCell>
                                                    {/* Available Funds */}
                                                    <TableCell align="right">
                                                        {
                                                            formatThousands(
                                                                makeDecimal(
                                                                    new BN(item.withdrawableAmount),
                                                                    associatedToken ? associatedToken.decimals : 6
                                                                ),
                                                                associatedToken ? associatedToken.decimals : 6
                                                            )
                                                        }
                                                    </TableCell>
                                                    {/* Details CTA */}
                                                    <TableCell align="right">
                                                        <IconButton
                                                            color="primary"
                                                            aria-label="Open Stream Details"
                                                            component="span"
                                                            onClick={() => props.setSelectedMoneyStream(item)}>
                                                            <ArrowCircleRightOutlined />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <TableRow style={{ height: 53 }}>
                                        <TableCell colSpan={7} sx={{ borderBottom: 'none' }}>
                                            {
                                                streamList === undefined && loadingStreams
                                                    ? 'Loading your streams'
                                                    : 'You have no streams'
                                            }
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                        </Table>
                    </TableContainer>
                    {streamList && streamList.length > 0 && (
                        <>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: streamList.length }]}
                                component="div"
                                count={streamList.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: {
                                    'aria-label': 'rows per page',
                                    },
                                    native: true,
                                }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                                />
                        </>
                    )}
                </Paper>

                {loadingStreams && (
                    <>
                        {streamList !== undefined && (
                            <Box
                                className="meanfi-panel-blurry"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 2
                                }}
                            />
                        )}
                        <CircularProgress
                            size={24}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                                zIndex: 3
                            }}
                        />
                    </>
                )}
        </React.Fragment>
    );
}

export { MoneyStreamsAccountsTable };
