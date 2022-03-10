import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ClickAwayListener, Box, Grid, Paper, Slide } from "@mui/material";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TokenInfo } from "@solana/spl-token-registry";
import { delay, formatAmount, getFormattedNumberToLocale, getTransactionStatusForLogs, isValidAddress, makeInteger, maxTrailingZeroes, shortenAddress } from "../../views/Meanfi/helpers/ui";
import { calculateActionFees, MSP, MSP_ACTIONS, Stream, TransactionFees } from "@mean-dao/msp";
import { AppStateContext } from "../../views/Meanfi/contexts/appstate";
import { MoneyStreamDetailsPane } from "../MoneyStreamDetailsPane";
import { MoneyStreamsAccountsTable } from "../MoneyStreamsAccountsTable";
import { TransactionStatus } from "../../views/Meanfi/models/enums";
import { MoneyStreamWithdrawModal } from "../MoneyStreamWithdrawModal";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { useNativeAccount } from "../../views/Meanfi/contexts/accounts";
import { NATIVE_SOL_MINT } from "../../views/Meanfi/helpers/ids";
import { NATIVE_SOL } from "../../views/Meanfi/models/token";
import BigNumber from "bignumber.js";
import { getTxIxResume } from "../../views/Meanfi/helpers/common";
import { snackNotifications } from "../../views/Meanfi/helpers/SnackBarUtils";

function MoneyStreamsPage() {
    // Import all of the data for meanfi here
    // Pass to my child components from here

    const { connection } = useConnection();
    const { account } = useNativeAccount();
    const { wallet, publicKey, connected, disconnecting, sendTransaction } = useWallet();
    const {
        endpoint,
        tokenList,
        streamList,
        streamDetail,
        selectedToken,
        selectedStream,
        loadingStreams,
        detailsPanelOpen,
        transactionStatus,
        streamProgramAddress,
        getTokenByMintAddress,
        setTransactionStatus,
        refreshTokenBalance,
        setDtailsPanelOpen,
        setSelectedStream,
        getStreamActivity,
        refreshStreamList,
        resetStreamsState,
        setSelectedToken,
        setEffectiveRate,
        setStreamDetail,
        setStreamList,
    } = useContext(AppStateContext);
    const [lastConnectState, setLastConnectState] = useState<boolean>(false);
    const [needRefresh, setNeedRefresh] = useState(true);
    const [previousBalance, setPreviousBalance] = useState(account?.lamports);
    const [nativeBalance, setNativeBalance] = useState(0);
    const [transactionCancelled, setTransactionCancelled] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [transactionFees, setTransactionFees] = useState<TransactionFees>({
        blockchainFee: 0, mspFlatFee: 0, mspPercentFee: 0
    });

    // Create and cache Money Streaming Program instance
    const msp = useMemo(() => {
        if (publicKey) {
            console.log('MSP instance from streams page');
            return new MSP(
                endpoint,
                streamProgramAddress,
                "finalized"
            );
        }
    }, [
        publicKey,
        endpoint,
        streamProgramAddress
    ]);

    /////////////////////////////////////////////
    //  Event handlers, getters and callbacks  //
    /////////////////////////////////////////////

    const getTokenAmountAndSymbolByTokenAddress = useCallback((
        amount: number,
        address: string,
        onlyValue = false
    ): string => {
        let token: TokenInfo | undefined = undefined;
        if (address) {
            if (address === NATIVE_SOL.address) {
                token = NATIVE_SOL as TokenInfo;
            } else {
                token = address ? tokenList.find(t => t.address === address) : undefined;
            }
        }
        const inputAmount = amount || 0;
        if (token) {
            const formatted = new BigNumber(formatAmount(inputAmount, token.decimals));
            const formatted2 = formatted.toFixed(token.decimals);
            const toLocale = getFormattedNumberToLocale(formatted2, 2);
            if (onlyValue) { return toLocale; }
            return `${toLocale} ${token.symbol}`;
        } else if (address && !token) {
            const unkToken: TokenInfo = {
                address: address,
                name: 'Unknown',
                chainId: 101,
                decimals: 6,
                symbol: shortenAddress(address),
            };
            const formatted = getFormattedNumberToLocale(formatAmount(inputAmount, unkToken.decimals));
            return onlyValue
                ? maxTrailingZeroes(formatted, 2)
                : `${maxTrailingZeroes(formatted, 2)} [${shortenAddress(address, 4)}]`;
        }
        return `${maxTrailingZeroes(getFormattedNumberToLocale(inputAmount), 2)}`;
    }, [tokenList]);

    const getDetailsPanelBackgroundClass = useCallback((item: Stream): string => {
        const isInbound = item && publicKey && item.beneficiary === publicKey.toBase58() ? true : false;
        return isInbound ? 'incoming-stream-detail' : 'outgoing-stream-detail';
    }, [publicKey]);

    const resetTransactionStatus = useCallback(() => {
        setTransactionStatus({
            lastOperation: TransactionStatus.Iddle,
            currentOperation: TransactionStatus.Iddle
        });
    }, [setTransactionStatus]);

    const getTransactionFees = useCallback(async (action: MSP_ACTIONS): Promise<TransactionFees> => {
        return await calculateActionFees(connection, action);
    }, [connection]);

    const setCustomToken = useCallback((address: string) => {
        if (address && isValidAddress(address)) {
            const unkToken: TokenInfo = {
                address: address,
                name: "Unknown",
                chainId: 101,
                decimals: 6,
                symbol: shortenAddress(address),
            };
            setSelectedToken(unkToken);
            setEffectiveRate(0);
            return unkToken;
        } else {
            console.error('Invalid solana address');
            return null;
        }
    }, [
        setEffectiveRate,
        setSelectedToken,
    ]);

    const setSelectedMoneyStream = (item: Stream) => {
        setSelectedStream(item);
        setDtailsPanelOpen(true);
        console.log('List item selected:', item);
    };

    const closeDetailsPanel = useCallback(() => {
        setSelectedStream(undefined);
        setDtailsPanelOpen(false);
    }, [
        setSelectedStream,
        setDtailsPanelOpen,
    ]);

    const getMoreActivities = useCallback(() => {
        if (streamDetail) {
            getStreamActivity(streamDetail.id as string, streamDetail.version);
        }
    }, [
        streamDetail,
        getStreamActivity,
    ]);

    const handleClickOutside = useCallback(() => {
        const panel = document.querySelector('.meanfi-sliding-panel');
        if (detailsPanelOpen && panel && panel.classList.contains('open')) {
            console.log('Dismiss panel by clicking outside...');
            closeDetailsPanel();
        }
    }, [
        detailsPanelOpen,
        closeDetailsPanel
    ]);

    // Withdraw funds modal
    const [lastStreamDetail, setLastStreamDetail] = useState<Stream | undefined>(undefined);
    const [isWithdrawModalVisible, setIsWithdrawModalVisibility] = useState(false);

    const showWithdrawModal = useCallback(async () => {
        const lastDetail = Object.assign({}, streamDetail);
        resetTransactionStatus();
        setLastStreamDetail(lastDetail);
        setIsWithdrawModalVisibility(true);
        getTransactionFees(MSP_ACTIONS.withdraw).then(value => {
            setTransactionFees(value);
            console.log('transactionFees:', value);
        });
    }, [
        streamDetail,
        getTransactionFees,
        resetTransactionStatus
    ]);

    const closeWithdrawModal = useCallback(() => {
        setLastStreamDetail(undefined);
        setIsWithdrawModalVisibility(false);
    }, []);

    const onWithdrawFundsTransactionFinished = useCallback(async () => {
        setIsBusy(false);
        await delay(300);
        closeWithdrawModal();
        resetTransactionStatus();
        snackNotifications.success('Withdraw transaction successfully completed');
        refreshTokenBalance();
        closeDetailsPanel();
        setNeedRefresh(true);
    }, [
        closeDetailsPanel,
        closeWithdrawModal,
        refreshTokenBalance,
        resetTransactionStatus,
    ]);

    const onWithdrawFundsTransactionFailed = useCallback(() => {
        setIsBusy(false);
        snackNotifications.warning('Withdraw transaction could not complete. Pleasy try again.');
    }, []);

    const onAcceptWithdraw = (amount: any) => {
        console.log('Withdraw amount:', parseFloat(amount));
        onExecuteWithdrawFundsTransaction(amount);
    };

    const onExecuteWithdrawFundsTransaction = useCallback(async (withdrawAmount: string) => {
        let transaction: Transaction;
        let signature: any;
        let encodedTx: string;
        const transactionLog: any[] = [];

        setTransactionCancelled(false);
        setIsBusy(true);

        const createTx = async (): Promise<boolean> => {
            if (publicKey && streamDetail && msp && selectedToken) {
                setTransactionStatus({
                    lastOperation: TransactionStatus.TransactionStart,
                    currentOperation: TransactionStatus.InitTransaction
                });

                const stream = new PublicKey(streamDetail.id as string);
                const beneficiary = new PublicKey((streamDetail as Stream).beneficiary as string);
                const amount = makeInteger(parseFloat(withdrawAmount as string), selectedToken.decimals);

                const data = {
                    stream: stream.toBase58(),
                    beneficiary: beneficiary.toBase58(),
                    amount: amount.toNumber()
                };
                console.log('withdraw params:', data);

                // Log input data
                transactionLog.push({
                    action: getTransactionStatusForLogs(TransactionStatus.TransactionStart),
                    inputs: data
                });

                transactionLog.push({
                    action: getTransactionStatusForLogs(TransactionStatus.InitTransaction),
                    result: ''
                });

                // Abort transaction if not enough balance to pay for gas fees and trigger TransactionStatus error
                // Whenever there is a flat fee, the balance needs to be higher than the sum of the flat fee plus the network fee
                console.log('blockchainFee:', transactionFees.blockchainFee + transactionFees.mspFlatFee);
                console.log('nativeBalance:', nativeBalance);
                if (nativeBalance < transactionFees.blockchainFee + transactionFees.mspFlatFee) {
                    setTransactionStatus({
                        lastOperation: transactionStatus.currentOperation,
                        currentOperation: TransactionStatus.TransactionStartFailure
                    });
                    transactionLog.push({
                        action: getTransactionStatusForLogs(TransactionStatus.TransactionStartFailure),
                        result: `Not enough balance (${getTokenAmountAndSymbolByTokenAddress(nativeBalance, NATIVE_SOL_MINT.toBase58())
                            }) to pay for network fees (${getTokenAmountAndSymbolByTokenAddress(transactionFees.blockchainFee + transactionFees.mspFlatFee, NATIVE_SOL_MINT.toBase58())
                            })`
                    });
                    console.warn('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                    return false;
                }

                console.log('Starting withdraw using MSP V2...');
                // Create a transaction
                return await msp.withdraw(
                    beneficiary,
                    stream,
                    amount.toNumber()
                )
                    .then(value => {
                        console.log('withdraw returned transaction:', value);
                        setTransactionStatus({
                            lastOperation: TransactionStatus.InitTransactionSuccess,
                            currentOperation: TransactionStatus.SignTransaction
                        });
                        transactionLog.push({
                            action: getTransactionStatusForLogs(TransactionStatus.InitTransactionSuccess),
                            result: getTxIxResume(value)
                        });
                        transaction = value;
                        return true;
                    })
                    .catch(error => {
                        console.error('withdraw error:', error);
                        setTransactionStatus({
                            lastOperation: transactionStatus.currentOperation,
                            currentOperation: TransactionStatus.InitTransactionFailure
                        });
                        transactionLog.push({
                            action: getTransactionStatusForLogs(TransactionStatus.InitTransactionFailure),
                            result: `${error}`
                        });
                        console.error('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                        return false;
                    });
            } else {
                transactionLog.push({
                    action: getTransactionStatusForLogs(TransactionStatus.WalletNotFound),
                    result: 'Cannot start transaction! Wallet not found!'
                });
                console.error('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                return false;
            }
        }

        const sendTx = async (): Promise<boolean> => {
            if (wallet && transaction) {
                try {
                    signature = await sendTransaction(transaction, connection);
                    console.log('sendSignedTransaction returned a signature:', signature);
                    setTransactionStatus({
                        lastOperation: TransactionStatus.SendTransactionSuccess,
                        currentOperation: TransactionStatus.ConfirmTransaction
                    });
                    transactionLog.push({
                        action: getTransactionStatusForLogs(TransactionStatus.SendTransactionSuccess),
                        result: `signature: ${signature}`
                    });
                    return true;
                } catch (error) {
                    console.error(error);
                    setTransactionStatus({
                        lastOperation: TransactionStatus.SendTransaction,
                        currentOperation: TransactionStatus.SendTransactionFailure
                    });
                    transactionLog.push({
                        action: getTransactionStatusForLogs(TransactionStatus.SendTransactionFailure),
                        result: { error, encodedTx }
                    });
                    console.error('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                    return false;
                }
            } else {
                console.error('Cannot send transaction! Wallet not found!');
                setTransactionStatus({
                    lastOperation: TransactionStatus.SendTransaction,
                    currentOperation: TransactionStatus.WalletNotFound
                });
                transactionLog.push({
                    action: getTransactionStatusForLogs(TransactionStatus.WalletNotFound),
                    result: 'Cannot send transaction! Wallet not found!'
                });
                console.error('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                return false;
            }
        }

        const confirmTx = async (): Promise<boolean> => {
            try {
                const result = await connection.confirmTransaction(signature, "finalized");
                console.info('confirmTransaction result:', result);
                if (result && result.value && !result.value.err) {
                    setTransactionStatus({
                        lastOperation: TransactionStatus.ConfirmTransactionSuccess,
                        currentOperation: TransactionStatus.TransactionFinished
                    });
                    transactionLog.push({
                        action: getTransactionStatusForLogs(TransactionStatus.TransactionFinished),
                        result: ''
                    });
                    return true;
                } else {
                    setTransactionStatus({
                        lastOperation: TransactionStatus.ConfirmTransaction,
                        currentOperation: TransactionStatus.ConfirmTransactionFailure
                    });
                    transactionLog.push({
                        action: getTransactionStatusForLogs(TransactionStatus.ConfirmTransactionFailure),
                        result: signature
                    });
                    console.error('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                    throw (result?.value?.err || new Error("Could not confirm transaction"));
                }
            } catch (error) {
                console.error(error);
                setTransactionStatus({
                    lastOperation: TransactionStatus.ConfirmTransaction,
                    currentOperation: TransactionStatus.ConfirmTransactionFailure
                });
                transactionLog.push({
                    action: getTransactionStatusForLogs(TransactionStatus.ConfirmTransactionFailure),
                    result: signature
                });
                console.error('Grape MeanFi widget Withdraw transaction failed', { transcript: transactionLog });
                return false;
            }
        }

        if (wallet && streamDetail) {
            const created = await createTx();
            console.log('created:', created);
            if (created && !transactionCancelled) {
                const sent = await sendTx();
                console.log('sent:', sent);
                if (sent && !transactionCancelled) {
                    const confirmed = await confirmTx();
                    console.log('confirmed:', confirmed);
                    if (confirmed) {
                        await delay(1000);
                        onWithdrawFundsTransactionFinished();
                    } else { onWithdrawFundsTransactionFailed(); }
                } else { onWithdrawFundsTransactionFailed(); }
            } else { onWithdrawFundsTransactionFailed(); }
        }
    }, [
        msp,
        wallet,
        publicKey,
        connection,
        streamDetail,
        selectedToken,
        nativeBalance,
        transactionCancelled,
        transactionFees.mspFlatFee,
        transactionFees.blockchainFee,
        transactionStatus.currentOperation,
        getTokenAmountAndSymbolByTokenAddress,
        onWithdrawFundsTransactionFinished,
        onWithdrawFundsTransactionFailed,
        setTransactionStatus,
        sendTransaction,
    ]);

    /////////////////////////
    //  Data manipulation  //
    /////////////////////////

    // Keep account balance updated
    useEffect(() => {

        const getAccountBalance = (): number => {
            return (account?.lamports || 0) / LAMPORTS_PER_SOL;
        }

        if (account?.lamports !== previousBalance || !nativeBalance) {
            // Refresh token balance
            refreshTokenBalance();
            setNativeBalance(getAccountBalance());
            // Update previous balance
            setPreviousBalance(account?.lamports);
        }
    }, [
        account,
        nativeBalance,
        previousBalance,
        refreshTokenBalance
    ]);

    // Handle wallet connect/disconnect
    useEffect(() => {
        if (lastConnectState !== connected) {
            // User is connecting
            if (!lastConnectState && connected) {
                if (publicKey) {
                    resetStreamsState();
                    setTimeout(() => {
                        setNeedRefresh(true);
                    }, 100);
                }
                setLastConnectState(true);
            } else if (lastConnectState && !connected) {
                setLastConnectState(false);
                console.log('User connected:', connected);
            }
        }
    }, [
        connected,
        publicKey,
        disconnecting,
        lastConnectState,
        resetStreamsState,
    ]);

    // Reload streams if needed
    useEffect(() => {
        if (needRefresh) {
            setNeedRefresh(false);
            refreshStreamList(true);
        }
    }, [
        needRefresh,
        refreshStreamList,
    ]);

    // Live data calculation - Streams list
    useEffect(() => {
        const refreshStreams = async () => {
            if (!msp || !streamList || !publicKey || loadingStreams) {
                return;
            }

            const updatedStreams = await msp.refreshStreams(
                (streamList as Stream[]) || [],
                publicKey
            );

            const newList: Array<Stream> = [];
            // Get an updated version for each stream in the list
            if (updatedStreams && updatedStreams.length) {
                let freshStream: Stream;
                for (const stream of updatedStreams) {
                    freshStream = await msp.refreshStream(stream);
                    if (freshStream) {
                        newList.push(freshStream);
                        if (streamDetail && streamDetail.id === stream.id) {
                            setStreamDetail(freshStream);
                        }
                    }
                }
            }

            // Finally update the combined list
            if (newList.length) {
                setStreamList(
                    newList.sort((a, b) =>
                        a.createdBlockTime < b.createdBlockTime ? 1 : -1
                    )
                );
            }
        };

        const timeout = setTimeout(() => {
            refreshStreams();
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [
        msp,
        publicKey,
        streamList,
        streamDetail,
        loadingStreams,
        setStreamDetail,
        setStreamList,
    ]);

    // Watch for stream's associated token changes then load the token to the state as selectedToken
    useEffect(() => {
        if (!streamDetail || !selectedToken) { return; }
        if (selectedToken.address !== streamDetail.associatedToken) {
            const token = getTokenByMintAddress(streamDetail.associatedToken as string);
            if (token) {
                console.log("stream token:", token);
                if (token.address !== selectedToken.address) {
                    setSelectedToken(token);
                }
            } else if (!token && (selectedToken.address !== streamDetail.associatedToken)) {
                const unkToken = setCustomToken(streamDetail.associatedToken as string);
                console.log("custom stream token:", unkToken);
            }
        }
    }, [
        streamDetail,
        selectedToken,
        setCustomToken,
        setSelectedToken,
        getTokenByMintAddress
    ]);

    return (
        <>
            <ClickAwayListener onClickAway={handleClickOutside}>
                <Grid item xs={12} md={12} lg={12}>
                    <Paper className="grape-paper-background">
                        <Box className="grape-paper">
                            <div className="money-streams-widget-wrapper">
                                <MoneyStreamsAccountsTable
                                    setSelectedMoneyStream={setSelectedMoneyStream}
                                    refreshMoneyStreams={() => refreshStreamList(true)}
                                />
                                <div className={selectedStream && detailsPanelOpen ? 'meanfi-sliding-panel open' : 'meanfi-sliding-panel'}>
                                    <Slide direction="left" in={detailsPanelOpen}>
                                        <Paper elevation={5} className={`grape-paper ${getDetailsPanelBackgroundClass(selectedStream)}`}>
                                            <MoneyStreamDetailsPane
                                                isOpen={detailsPanelOpen}
                                                onCloseDetaisPane={() => closeDetailsPanel()}
                                                onLoadMoreActivity={() => getMoreActivities()}
                                                onRequestWithdraw={() => showWithdrawModal()}
                                            />
                                        </Paper>
                                    </Slide>
                                </div>
                                <MoneyStreamWithdrawModal
                                    startUpData={lastStreamDetail}
                                    transactionFees={transactionFees}
                                    isVisible={isWithdrawModalVisible}
                                    mspClient={msp}
                                    isBusy={isBusy}
                                    handleOk={onAcceptWithdraw}
                                    handleClose={closeWithdrawModal}
                                />
                            </div>
                        </Box>
                    </Paper>
                </Grid>
            </ClickAwayListener>
        </>
    );
}

export { MoneyStreamsPage }
