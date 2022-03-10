import { useCallback, useContext, useEffect, useState } from "react";
import { MSP, Stream, STREAM_STATUS, TransactionFees } from "@mean-dao/msp";
import { TokenInfo } from "@solana/spl-token-registry";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { makeDecimal, percentage } from "../../views/Meanfi/helpers/ui";
import { isValidNumber } from "../../views/Meanfi/helpers/common";
import { Grid, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LoadingButton from '@mui/lab/LoadingButton';
import { AppStateContext } from "../../views/Meanfi/contexts/appstate";
import { TransactionStatus } from "../../views/Meanfi/models/enums";
import BN from "bn.js";
import { snackNotifications } from "../../views/Meanfi/helpers/SnackBarUtils";

export const MoneyStreamWithdrawModal = (props: {
    startUpData: Stream | undefined;
    handleClose: any;
    handleOk: any;
    isBusy?: boolean;
    isVisible: boolean;
    mspClient: MSP | undefined;
    transactionFees: TransactionFees;
  }) => {

    const { wallet, publicKey } = useWallet();
    const {
        selectedToken,
        transactionStatus,
        getTokenByMintAddress
    } = useContext(AppStateContext);
    const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>("");
    const [maxAmount, setMaxAmount] = useState<number>(0);
    const [feeAmount, setFeeAmount] = useState<number | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [feePayedByTreasurer, setFeePayedByTreasurer] = useState(false);

    const getFeeAmount = useCallback((fees: TransactionFees, amount?: any): number => {
        let fee = 0;
        const inputAmount = amount ? parseFloat(amount) : 0;
        if (fees) {
            if (fees.mspPercentFee) {
                fee = inputAmount ? percentage(fees.mspPercentFee, inputAmount) : 0;
            } else if (fees.mspFlatFee) {
                fee = fees.mspFlatFee;
            }
        }
        return feePayedByTreasurer ? 0 : fee;
    }, [feePayedByTreasurer]);

    const getDisplayAmount = useCallback((amount: number, addSymbol = false): string => {
        if (!selectedToken || !props.startUpData) { return '-'; }

        let token: TokenInfo;

        if (selectedToken) {
            token = selectedToken;
        } else if (props.startUpData) {
            token = getTokenByMintAddress(props.startUpData.associatedToken as string);
        }

        const bareAmount = amount.toFixed(token.decimals);
        if (addSymbol) {
            return token.name === 'Unknown'
                ? `${bareAmount} [${selectedToken.symbol}]`
                : `${bareAmount} ${selectedToken.symbol}`;
        }
        return bareAmount;
    }, [
        selectedToken,
        props.startUpData,
        getTokenByMintAddress
    ]);

    const canCancelTx = useCallback(() => {
        /**
         * A tx is cancelable if not busy || if busy but status is not already confirming tx
         */
        if (props.isBusy && transactionStatus.currentOperation === TransactionStatus.ConfirmTransaction ) {
            return false;
        }

        return true;
    }, [
        props.isBusy,
        transactionStatus.currentOperation
    ]);

    useEffect(() => {

        if (!wallet || !publicKey) { return; }

        const getStreamDetails = async (streamId: string, client: MSP) => {
            const errosMsg = 'Could not load recent stream data, please try again.';
            let streamPublicKey: PublicKey;
            streamPublicKey = new PublicKey(streamId as string);
            try {
                const detail = await client.getStream(streamPublicKey);
                if (detail) {
                    console.log('detail', detail);
                    const max = makeDecimal(new BN(detail.withdrawableAmount), selectedToken?.decimals || 6);
                    setFeePayedByTreasurer(detail.feePayedByTreasurer);
                    setMaxAmount(max);
                } else {
                    snackNotifications.warning(errosMsg);
                }
            } catch (error) {
                snackNotifications.warning(errosMsg);
            } finally {
                setLoadingData(false);
            }
        }

        if (props.startUpData) {

            const stream = props.startUpData;
            const max = makeDecimal(new BN(stream.withdrawableAmount), selectedToken ? selectedToken.decimals : 6);

            if (stream.status === STREAM_STATUS.Running) {
                setMaxAmount(max);
                setLoadingData(true);
                getStreamDetails(stream.id as string, props.mspClient);
            } else {
                setMaxAmount(max);
                setFeePayedByTreasurer(stream.feePayedByTreasurer);
            }
        }

    }, [
        wallet,
        publicKey,
        selectedToken,
        props.mspClient,
        props.startUpData,
    ]);

    useEffect(() => {
        if (!feeAmount && props.transactionFees) {
            setFeeAmount(getFeeAmount(props.transactionFees));
        }
    }, [
        feeAmount,
        props.transactionFees,
        getFeeAmount
    ]);

    const onAcceptWithdrawal = () => {
        const isMaxAmount = getDisplayAmount(maxAmount) === getDisplayAmount(+withdrawAmountInput)
            ? true : false;
        // setWithdrawAmountInput('');
        props.handleOk(isMaxAmount ? maxAmount : withdrawAmountInput);
    };

    const onCloseModal = () => {
        setWithdrawAmountInput('');
        props.handleClose();
    }

    const setValue = (value: string) => {
        setWithdrawAmountInput(value);
    };

    const setPercentualValue = (value: number) => {
        let newValue = '';
        let fee = 0;
        if (props.startUpData) {
            if (value === 100) {
                fee = getFeeAmount(props.transactionFees, maxAmount)
                newValue = getDisplayAmount(maxAmount);
            } else {
                const partialAmount = percentage(value, maxAmount);
                fee = getFeeAmount(props.transactionFees, partialAmount)
                newValue = getDisplayAmount(partialAmount);
            }
        }
        setValue(newValue);
        setFeeAmount(fee);
    }

    const handleWithdrawAmountChange = (e: any) => {
        const newValue = e.target.value;
        if (newValue === null || newValue === undefined || newValue === "") {
            setValue("");
        } else if (newValue === '.') {
            setValue(".");
        } else if (isValidNumber(newValue)) {
            setValue(newValue);
            setFeeAmount(getFeeAmount(props.transactionFees, newValue));
        }
    };

    // Validation

    const isValidInput = (): boolean => {
        return props.startUpData &&
            withdrawAmountInput &&
            parseFloat(withdrawAmountInput) <= parseFloat(getDisplayAmount(maxAmount)) &&
            parseFloat(withdrawAmountInput) > (feeAmount as number)
            ? true
            : false;
    }

    const infoRow = (caption: string, value: string) => {
        return (
            <Grid container spacing={2}>
                <Grid item xs container direction="row" spacing={1}>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                        <Typography variant="body2">
                            {caption}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                            {value}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    return (
        <div>
            <Dialog
                aria-labelledby="meanfi-stream-withdraw-modal"
                fullWidth={true}
                open={props.isVisible}
                onClose={(_, reason) => {
                    if (reason !== "backdropClick") {
                        props.handleClose();
                    }
                }}>
                <DialogTitle id="meanfi-stream-withdraw-modal">Withdraw funds</DialogTitle>
                <DialogContent>

                    <div className="form-label">Funds available to withdraw now</div>
                    <div className="well disabled">
                        <div className="flex-fixed-right">
                            <div className="left static-data-field">{props.startUpData && getDisplayAmount(maxAmount, true)}</div>
                            <div className="right">&nbsp;</div>
                        </div>
                    </div>

                    <div className="form-label">Enter amount to withdraw</div>
                    <div className={`well ${loadingData || props.isBusy ? 'disabled' : ''}`}>
                        <div className="flex-fixed-right">
                            <div className="left inner-label">&nbsp;</div>
                            <div className="right">
                                <div className="addon">
                                    <div className="token-group">
                                        <div
                                            className="token-max simplelink"
                                            onClick={() => setPercentualValue(25)}>
                                            25%
                                        </div>
                                        <div
                                            className="token-max simplelink"
                                            onClick={() => setPercentualValue(50)}>
                                            50%
                                        </div>
                                        <div
                                            className="token-max simplelink"
                                            onClick={() => setPercentualValue(75)}>
                                            75%
                                        </div>
                                        <div
                                            className="token-max simplelink"
                                            onClick={() => setPercentualValue(100)}>
                                            100%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-fixed-right">
                            <div className="left">
                                <input
                                    className="general-text-input"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    type="text"
                                    onChange={handleWithdrawAmountChange}
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    placeholder="0.0"
                                    minLength={1}
                                    maxLength={79}
                                    spellCheck="false"
                                    value={withdrawAmountInput}
                                />
                            </div>
                            <div className="right">&nbsp;</div>
                        </div>
                        {parseFloat(withdrawAmountInput) > parseFloat(getDisplayAmount(maxAmount)) ? (
                            <span className="form-field-error">Amount is greater than the available funds</span>
                        ) : (null)}
                    </div>

                    {/* Info */}
                    {selectedToken && (
                        <div className="p-2 mb-2">
                            {isValidInput() && infoRow(
                                'Transaction fee:',
                                `~${getDisplayAmount((feeAmount as number), true)}`
                            )}
                            {isValidInput() && infoRow(
                                'You receive:',
                                `~${getDisplayAmount(parseFloat(withdrawAmountInput) - (feeAmount as number), true)}`
                            )}
                        </div>
                    )}

                </DialogContent>
                <DialogActions sx={{ p: '8px 24px 20px 24px' }}>
                    <Button
                        disabled={!canCancelTx()}
                        onClick={onCloseModal}>
                        Cancel
                    </Button>
                    <LoadingButton
                        disabled={!isValidInput()}
                        onClick={onAcceptWithdrawal}
                        loading={props.isBusy}
                        loadingPosition="end"
                        endIcon={<AccountBalanceWalletIcon />}
                        variant="contained">
                        {props.isBusy ? 'Withdrawing' : 'Start withdrawal'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}
