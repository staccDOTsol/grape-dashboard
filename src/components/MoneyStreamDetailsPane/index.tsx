import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import { useCallback, useContext } from "react";
import Jazzicon from 'react-jazzicon'
import { Stream, StreamActivity, STREAM_STATUS } from "@mean-dao/msp";
import { useWallet } from "@solana/wallet-adapter-react";
import BN from "bn.js";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyToClipboard from "react-copy-to-clipboard";
import { AppStateContext } from "../../views/Meanfi/contexts/appstate";
import { SOLANA_EXPLORER_URI_INSPECT_TRANSACTION } from "../../views/Meanfi/constants";
import { formatThousands, getIntervalFromSeconds, getShortDate, makeDecimal, shortenAddress } from "../../views/Meanfi/helpers/ui";
import { getSolanaExplorerClusterParamByClusterName } from "../../views/Meanfi/helpers/common";
import { snackNotifications } from "../../views/Meanfi/helpers/SnackBarUtils";
import bs58 from "bs58";

export interface MoneyStreamDetailsPaneProps {
    isOpen: boolean;
    onLoadMoreActivity?: () => void;
    onRequestWithdraw?: () => void;
    onCloseDetaisPane?: () => void;
}

function MoneyStreamDetailsPane(props: MoneyStreamDetailsPaneProps){

    const { publicKey } = useWallet();
    const {
        network,
        streamDetail,
        selectedToken,
        selectedStream,
        streamActivity,
        hasMoreStreamActivity,
        loadingStreamActivity,
        getTokenByMintAddress,
    } = useContext(AppStateContext);

    const openTxInBlockChainExplorer = useCallback((signature: string) => {
        const explorerUrl = `${SOLANA_EXPLORER_URI_INSPECT_TRANSACTION}${signature}${getSolanaExplorerClusterParamByClusterName(network)}`;
        window.open(explorerUrl, '_blank', 'noopener noreferrer');
    }, [network]);

    const getTokenSymbolByAddress = useCallback((address: string, includeSpace = true, includeName = false) => {
        let symbolStr = includeSpace ? ' ' : '';
        symbolStr += selectedToken && selectedToken.name !== 'Unknown'
            ? includeName
                ? `${selectedToken.symbol} (${selectedToken.name})`
                : `${selectedToken.symbol}`
            : `[${shortenAddress(address as string, 6)}]`;
        return symbolStr;
    }, [selectedToken]);

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

    const getStreamStatusSubtitle = useCallback((item: Stream) => {
        if (item) {
            switch (item.status) {
                case STREAM_STATUS.Schedule:
                    return `Starts on ${getShortDate(item.startUtc as string)}`;
                case STREAM_STATUS.Paused:
                    if (item.isManuallyPaused) {
                        return 'Manually stopped';
                    }
                    return 'Ran out of funds';
                default:
                    return 'Streaming';
            }
        }
    }, []);

    const getRateAmountDisplay = useCallback((item: Stream): string => {
        let value = '';

        if (item) {
            const token = item.associatedToken ? getTokenByMintAddress(item.associatedToken as string) : undefined;
            value += formatThousands(makeDecimal(new BN(item.rateAmount), token?.decimals || 6), 4);
            if (token && token.name !== 'Unknown') {
                value += ` ${token.symbol}`;
            } else {
                value += ` [${shortenAddress(item.associatedToken as string, 6)}]`;
            }
        }
        return value;
    }, [getTokenByMintAddress]);

    const getDepositAmountDisplay = useCallback((item: Stream): string => {
        let value = '';

        if (item && item.rateAmount === 0 && item.allocationAssigned > 0) {
            const token = item.associatedToken ? getTokenByMintAddress(item.associatedToken as string) : undefined;
            value += formatThousands(makeDecimal(new BN(item.rateAmount), token?.decimals || 6), 4);
            if (token && token.name !== 'Unknown') {
                value += ` ${token.symbol}`;
            } else {
                value += ` [${shortenAddress(item.associatedToken as string, 6)}]`;
            }
        }
        return value;
    }, [getTokenByMintAddress]);

    const getStreamDescription = useCallback((item: Stream): string => {
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
    }, [isInboundStream]);

    const getStreamDescriptionSubtitle = useCallback((item: Stream) => {
        let title = '';

        if (item) {
            const isInbound = isInboundStream(item);
            let rateAmount = item.rateAmount > 0 ? getRateAmountDisplay(item) : getDepositAmountDisplay(item);
            if (item.rateAmount > 0) {
                rateAmount += ' ' + getIntervalFromSeconds(item.rateIntervalInSeconds, false);
            }

            if (isInbound) {
                if (item.status === STREAM_STATUS.Schedule) {
                    title = `Scheduled to receive ${rateAmount} on`;
                } else {
                    title = `Receiving ${rateAmount} since`;
                }
            } else {
                if (item.status === STREAM_STATUS.Schedule) {
                    title = `Scheduled to send ${rateAmount} on`;
                } else {
                    title = `Sending ${rateAmount} since`;
                }
            }
            title += ` ${getShortDate(item.startUtc as string)}`;
        }

        return title;

    }, [
        isInboundStream,
        getDepositAmountDisplay,
        getRateAmountDisplay,
    ]);

    const getSenderOrBeneficiaryLabel = useCallback((item: Stream) => {
        let title = 'Reference';

        if (item) {
            const isInbound = isInboundStream(item);
            if (isInbound) {
                if (item.status === STREAM_STATUS.Paused) {
                    title = 'Received from';
                } else {
                    title = 'Receiving from';
                }
            } else {
                if (item.status === STREAM_STATUS.Paused) {
                    title = 'Sent to';
                } else {
                    title = 'Sending to';
                }
            }
        }

        return title;

    }, [isInboundStream]);

    const isOtp = (): boolean => {
        return streamDetail?.rateAmount === 0 ? true : false;
    }

    const getActivityAction = (item: StreamActivity): string => {
        return item
            ? item.action === 'deposited'
                ? 'Deposit'
                : 'Withdraw'
            : '-';
    }

    const handleCopyStreamId = () => {
        snackNotifications.toast('Stream address copied');
    }

    return (
        <>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                    className="grape-dashboard-component-header"
                    sx={{ position: "relative" }}>
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{ m: 0, position: "relative" }}>
                        STREAM DETAILS
                    </Typography>
                </Box>
                <Box sx={{ mt: 1, mr: 1 }}>
                    <IconButton
                        color="primary"
                        aria-label="Back to list of streams"
                        component="span"
                        onClick={() => props.onCloseDetaisPane()}>
                        <ArrowBackIcon />
                    </IconButton>
                </Box>
            </Box>
            {/* Transfer highlights */}
            {selectedStream && (
                <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 1 }}>
                        <Box className="grape-dashboard-component-header" justifyContent="center" alignItems="center">
                            {selectedToken && selectedToken.logoURI ? (
                                <Avatar
                                    component={Paper}
                                    elevation={4}
                                    alt={selectedToken.name}
                                    src={selectedToken.logoURI}
                                    sx={{ width: 34, height: 34, bgcolor: "#222" }}
                                />
                            ) : (
                                <Box sx={{ height: 34 }}>
                                    <Jazzicon
                                        diameter={34}
                                        seed={parseInt(bs58.decode(selectedStream.associatedToken as string).toString("hex").slice(5, 15), 16)} />
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flex: 'auto', flexDirection: 'column', mx: 1}}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', minWidth: 0, justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" noWrap>
                                    {getStreamDescription(selectedStream)}
                                </Typography>
                                <CopyToClipboard
                                    text={selectedStream.id as string}
                                    onCopy={handleCopyStreamId}>
                                    <Tooltip title="Copy stream ID">
                                        <ContentCopyIcon sx={{ fontSize: '14px', cursor: 'pointer' }} />
                                    </Tooltip>
                                </CopyToClipboard>
                            </Box>
                            <Typography noWrap variant="body2" color="text.secondary">
                                {getStreamDescriptionSubtitle(selectedStream)}
                            </Typography>
                        </Box>
                        {!isOtp() && (
                            <Box sx={{ display: 'flex', flex: '0 0 auto', flexDirection: 'column', mr: 1, textAlign: 'right' }}>
                                <Typography variant="body2" noWrap>
                                    {getRateAmountDisplay(selectedStream)}&nbsp;
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {getIntervalFromSeconds(selectedStream.rateIntervalInSeconds, false)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </>
            )}
            {selectedStream && streamDetail && <Divider />}
            {/* Transfer details */}
            {streamDetail && (
                <Box sx={{ flexGrow: 1, p: 2 }}>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {getSenderOrBeneficiaryLabel(streamDetail)}
                                </Typography>
                                <Typography variant="body2" gutterBottom sx={{ fontSize: '1.2rem' }}>
                                    {
                                        isInboundStream(streamDetail)
                                            ? shortenAddress(`${streamDetail.treasurer}`, 6)
                                            : shortenAddress(`${streamDetail.beneficiary}`, 6)
                                    }
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Funds left in account
                                </Typography>
                                <Typography variant="body2" gutterBottom sx={{ fontSize: '1.2rem' }}>
                                {
                                    isOtp()
                                        ?   formatThousands(
                                                makeDecimal(
                                                    new BN(streamDetail.status === STREAM_STATUS.Schedule
                                                            ? streamDetail.allocationAssigned
                                                            : streamDetail.withdrawableAmount
                                                    ),
                                                    selectedToken ? selectedToken.decimals : 6
                                                ),
                                                selectedToken ? selectedToken.decimals : 6,
                                                selectedToken ? selectedToken.decimals : 6
                                            )
                                        :   formatThousands(
                                                makeDecimal(
                                                    new BN(streamDetail.fundsLeftInStream),
                                                    selectedToken ? selectedToken.decimals : 6
                                                ),
                                                selectedToken ? selectedToken.decimals : 6,
                                                selectedToken ? selectedToken.decimals : 6
                                            )
                                }
                                {getTokenSymbolByAddress(streamDetail.associatedToken as string)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ marginLeft: '28px' }}>
                                    Status
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        {isInboundStream(streamDetail) ? (
                                            <>
                                            {streamDetail.status === STREAM_STATUS.Running ? (
                                                <ArrowDownwardOutlinedIcon className="stream-type-incoming bounce" />
                                            ) : (
                                                <ArrowDownwardOutlinedIcon className="stream-type-incoming" />
                                            )}
                                            </>
                                        ) : (
                                            <>
                                            {streamDetail.status === STREAM_STATUS.Running ? (
                                                <ArrowUpwardOutlinedIcon className="stream-type-outgoing bounce" />
                                            ) : (
                                                <ArrowUpwardOutlinedIcon className="stream-type-outgoing" />
                                            )}
                                            </>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', pl: 1 }}>
                                        <Box className="pill small">{getStreamStatus(streamDetail)}</Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 'normal', lineHeight: 1, marginTop: '4px', marginLeft: '1px' }}>
                                            {getStreamStatusSubtitle(streamDetail)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}
            {/* Stream activity */}
            {loadingStreamActivity && (
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
            )}
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 2, mx: 1 }}>
                <Box
                    className="grape-dashboard-component-header"
                    sx={{ m: 0, position: "relative" }}>
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{ m: 0, position: "relative" }}>
                        Stream activity
                    </Typography>
                </Box>
                <Box sx={{ mr: 1 }}>
                    {hasMoreStreamActivity && (
                        <Button
                            aria-label="Load more activities"
                            disabled={loadingStreamActivity}
                            size="small"
                            onClick={() => props.onLoadMoreActivity()}>
                            Load more
                        </Button>
                    )}
                </Box>
            </Box>
            {streamActivity && streamActivity.length > 0 ? (
                <Paper elevation={0}
                        className={`${loadingStreamActivity ? 'click-disabled' : ''}`}
                        sx={{ width: '100%', overflow: 'hidden', backgroundColor: 'transparent' }}>
                    <TableContainer className="stream-activity-table" sx={{ backgroundColor: 'inherit' }}>
                        <Table size="small" stickyHeader aria-label="Money Streams" sx={{ backgroundColor: 'inherit' }}>
                            <TableHead className="stream-activity-table-header">
                                <TableRow sx={{ backgroundColor: 'inherit' }}>
                                    <TableCell sx={{ backgroundColor: 'inherit' }}>
                                        <Typography variant="caption" textTransform='uppercase'>Signer</Typography>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: 'inherit' }}>
                                        <Typography variant="caption" textTransform='uppercase'>Action</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ backgroundColor: 'inherit' }}>
                                        <Typography variant="caption" textTransform='uppercase'>Amount</Typography>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: 'inherit' }}>
                                        <Typography variant="caption" textTransform='uppercase'>Timestamp</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {streamActivity.map((item: StreamActivity, index: number) => {
                                    const associatedToken = item.mint ? getTokenByMintAddress(item.mint as string) : undefined;
                                    return (
                                        <TableRow
                                            key={`${index}`}
                                            id={`${item.signature}`}
                                            className="hoverable-row">
                                            {/* Signer */}
                                            <TableCell style={{ verticalAlign: "middle" }} onClick={() => openTxInBlockChainExplorer(item.signature)} sx={{ backgroundColor: 'inherit' }}>
                                                {shortenAddress(item.initializer, 6)}
                                            </TableCell>
                                            {/* Action */}
                                            <TableCell style={{ verticalAlign: "middle" }} onClick={() => openTxInBlockChainExplorer(item.signature)} sx={{ backgroundColor: 'inherit' }}>
                                                {getActivityAction(item)}
                                            </TableCell >
                                            {/* Amount */}
                                            <TableCell align="right" onClick={() => openTxInBlockChainExplorer(item.signature)} sx={{ backgroundColor: 'inherit' }}>
                                                {
                                                    formatThousands(
                                                        makeDecimal(
                                                            new BN(item.amount),
                                                            associatedToken ? associatedToken.decimals : 6
                                                        ),
                                                        associatedToken ? associatedToken.decimals : 6
                                                    )
                                                }
                                                {getTokenSymbolByAddress(item.mint as string)}
                                            </TableCell>
                                            {/* Available Funds */}
                                            <TableCell onClick={() => openTxInBlockChainExplorer(item.signature)} sx={{ backgroundColor: 'inherit' }}>
                                                {getShortDate(item.utcDate as string, true)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>

                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', p: 2, my: 2 }}>
                    {loadingStreamActivity ? 'Loading stream activity' : 'No activity found'}
                </Box>
            )}
            {/* Withdraw */}
            {isInboundStream(streamDetail) && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Available
                        </Typography>
                        <Typography variant="body2" gutterBottom sx={{ fontSize: '1.2rem' }}>
                        {
                            formatThousands(
                                makeDecimal(
                                    new BN(streamDetail.withdrawableAmount),
                                    selectedToken ? selectedToken.decimals : 6
                                ),
                                selectedToken ? selectedToken.decimals : 6,
                                selectedToken ? selectedToken.decimals : 6
                            )
                        }
                        {getTokenSymbolByAddress(streamDetail.associatedToken as string)}
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            aria-label="Withdraw available funds"
                            disabled={streamDetail.withdrawableAmount === 0}
                            onClick={() => props.onRequestWithdraw()}>
                            WITHDRAW
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    );

}

export { MoneyStreamDetailsPane }
