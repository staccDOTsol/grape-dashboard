import bs58 from "bs58";
import BN from "bn.js";
import { TokenInfo } from "@solana/spl-token-registry";
import { PaymentRateType, TransactionStatus } from "../models/enums";
import { TransactionStatusInfo } from "../models/transactions";
import {
    SIMPLE_DATE_FORMAT,
    SIMPLE_DATE_TIME_FORMAT,
    VERBOSE_DATE_FORMAT,
    VERBOSE_DATE_TIME_FORMAT
} from "../constants";
import dateFormat from "dateformat";

export class PaymentRateTypeOption {
    key: number;
    value: PaymentRateType;
    text: string;

    constructor(
        public _key: number,
        public _value: PaymentRateType,
        public _text: string
    ) {
        this.key = _key;
        this.value = _value;
        this.text = _text;
    }
}

export const formatters = {
    default: new Intl.NumberFormat(),
    currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    whole: new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    oneDecimal: new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    twoDecimal: new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })
};

export const twoDigits = (num: number) => String(num).padStart(2, '0')

export function isValidAddress(value: any): boolean {
    if (typeof value === 'string') {
        try {
            // assume base 58 encoding by default
            const decoded = bs58.decode(value);
            if (decoded.length === 32) {
                return true;
            }
        } catch (error) {
            return false;
        }
    }
    return false;
}

export function shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getTransactionModalTitle(status: TransactionStatusInfo, isBusy: boolean): string {
    let title: any;
    if (isBusy) {
        title = 'Executing transaction';
    } else {
        if (
            status.lastOperation === TransactionStatus.Iddle &&
            status.currentOperation === TransactionStatus.Iddle
        ) {
            title = null;
        } else if (
            status.currentOperation ===
            TransactionStatus.TransactionStartFailure
        ) {
            title = 'Transaction canceled';
        } else if (
            status.lastOperation ===
            TransactionStatus.TransactionFinished
        ) {
            title = 'Transaction completed';
        } else {
            title = null;
        }
    }
    return title;
};

export function getTransactionStatusForLogs(status: TransactionStatus): string {
    switch (status) {
        case TransactionStatus.WalletNotFound:
            return 'Wallet not found';
        case TransactionStatus.TransactionStart:
            return 'Collecting transaction data';
        case TransactionStatus.TransactionStarted:
            return 'Transaction started';
        case TransactionStatus.TransactionStartFailure:
            return 'Cannot start transaction';
        case TransactionStatus.InitTransaction:
            return 'Init transaction';
        case TransactionStatus.InitTransactionSuccess:
            return 'Transaction successfully initialized';
        case TransactionStatus.InitTransactionFailure:
            return 'Could not init transaction';
        case TransactionStatus.SignTransaction:
            return 'Waiting for wallet approval';
        case TransactionStatus.SignTransactionSuccess:
            return 'Transaction signed by the wallet';
        case TransactionStatus.SignTransactionFailure:
            return 'Transaction rejected';
        case TransactionStatus.SendTransaction:
            return 'Sending transaction';
        case TransactionStatus.SendTransactionSuccess:
            return 'Transaction sent successfully';
        case TransactionStatus.SendTransactionFailure:
            return 'Failure submitting transaction';
        case TransactionStatus.ConfirmTransaction:
            return 'Confirming transaction';
        case TransactionStatus.ConfirmTransactionSuccess:
            return 'Confirm transaction succeeded';
        case TransactionStatus.ConfirmTransactionFailure:
            return 'Confirm transaction failed';
        case TransactionStatus.TransactionFinished:
            return 'Transaction finished';
        case TransactionStatus.SendTransactionFailureByMinimumAmount:
            return 'Send transaction failure. Minimum amount required';
        case TransactionStatus.CreateRecurringBuySchedule:
            return 'Create recurring exchange schedule';
        case TransactionStatus.CreateRecurringBuyScheduleSuccess:
            return 'Recurring exchange created successfully';
        case TransactionStatus.CreateRecurringBuyScheduleFailure:
            return 'Could not create the recurring exchange';
        default:
            return ''; // 'Idle';
    }
}

export const copyText = (val: any): boolean => {
    if (!val) { return false; }
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.id = 'copyContainerInputElement';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val.toString();
    document.body.appendChild(selBox);
    const element = document.getElementById('copyContainerInputElement') as HTMLInputElement;
    if (element) {
        element.focus();
        element.select();
        document.execCommand('copy', false);
        document.body.removeChild(selBox);
        return true;
    } else {
        console.log('copyContainerInputElement could not be ', 'created/found');
    }
    return false;
}

export function getRemainingDays(targetDate?: string): number {
    const date = new Date();
    const time = new Date(date.getTime());
    const toDate = targetDate ? new Date(targetDate) : null;
    if (toDate) {
        time.setMonth(toDate.getMonth());
    } else {
        time.setMonth(date.getMonth() + 1);
    }
    time.setDate(0);
    return time.getDate() > date.getDate() ? time.getDate() - date.getDate() : 0;
}

var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

const abbreviateNumber = (number: number, precision: number) => {
    if (number === undefined) {
        return '--';
    }
    let tier = (Math.log10(number) / 3) | 0;
    let scaled = number;
    let suffix = SI_SYMBOL[tier];
    if (tier !== 0) {
        let scale = Math.pow(10, tier * 3);
        scaled = number / scale;
    }

    return scaled.toFixed(precision) + suffix;
};

export const formatAmount = (
    val: number,
    precision: number = 6,
    abbr: boolean = false
) => {
    if (val) {
        if (abbr) {
            return abbreviateNumber(val, precision);
        } else {
            return val.toFixed(precision);
        }
    }
    return '0';
};

export function timeConvert(n: number, decimals = 0, abbr = false): string {
    const num = n;
    const hours = (num / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    const rdays = Math.round(rhours / 24);
    let returnString = '';
    if (num === 1) {
        returnString = `${num} minute.`;
    } else if (num === 60) {
        returnString = '1 hour.';
    } else if (num > 60) {
        returnString = `${formatAmount(num, decimals, abbr)} minutes`;
        if (rdays > 1) {
            returnString += `. ~${rdays} days.`;
        } else {
            returnString = ` = ${formatAmount(rhours, decimals, abbr)} hour(s) and ${rminutes} minutes.`;
        }
    } else {
        returnString = `${rminutes} minutes.`;
    }
    return returnString;
}

export const formatThousands = (val: number, maxDecimals?: number, minDecimals = 0) => {
    let convertedVlue: Intl.NumberFormat;

    if (maxDecimals) {
        convertedVlue = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: maxDecimals
        });
    } else {
        convertedVlue = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: 0
        });
    }

    return convertedVlue.format(val);
}

export const getPaymentRateOptionLabel = (val: PaymentRateType): string => {
    let result = '';
    switch (val) {
        case PaymentRateType.PerMinute:
            result = 'per minute';
            break;
        case PaymentRateType.PerHour:
            result = 'per hour';
            break;
        case PaymentRateType.PerDay:
            result = 'per day';
            break;
        case PaymentRateType.PerWeek:
            result = 'per week';
            break;
        case PaymentRateType.PerMonth:
            result = 'per month';
            break;
        case PaymentRateType.PerYear:
            result = 'per year';
            break;
        default:
            break;
    }
    return result;
}

export const getAmountWithTokenSymbol = (
    amount: any,
    token: TokenInfo,
    decimals = 2,
    abbr = false
): string => {
    if (!token) { return '--'; }
    const converted = amount ? amount.toString() : '0';
    const parsed = parseFloat(converted);
    return `${formatAmount(parsed, decimals, abbr)} ${token.symbol}`;
}

export const getRateIntervalInSeconds = (frequency: PaymentRateType): number => {
    let value = 60;
    switch (frequency) {
        case PaymentRateType.PerMinute:
            value = 60;
            break;
        case PaymentRateType.PerHour:
            value = 3600;
            break;
        case PaymentRateType.PerDay:
            value = 86400;
            break;
        case PaymentRateType.PerWeek:
            value = 604800;
            break;
        case PaymentRateType.PerMonth:
            value = 2629750;
            break;
        case PaymentRateType.PerYear:
            value = 31557000;
            break;
        default:
            break;
    }
    return value;
}

export const getTransactionOperationDescription = (status: TransactionStatus | undefined): string => {
    switch (status) {
        case TransactionStatus.TransactionStart:
            return 'Collecting data';
        case TransactionStatus.InitTransaction:
            return 'Init transaction';
        case TransactionStatus.SignTransaction:
            return 'Waiting for confirmation';
        case TransactionStatus.SendTransaction:
            return 'Sending transaction';
        case TransactionStatus.ConfirmTransaction:
            return 'Confirming transaction';
        case TransactionStatus.InitTransactionFailure:
            return 'Could not init transaction';
        case TransactionStatus.SignTransactionFailure:
            return 'Transaction rejected';
        case TransactionStatus.SendTransactionFailure:
            return 'Failure submitting transaction';
        case TransactionStatus.CreateRecurringBuySchedule:
            return 'Create scheduled recurring exchange';
        case TransactionStatus.CreateRecurringBuyScheduleSuccess:
            return 'Recurring exchange created successfully';
        case TransactionStatus.CreateRecurringBuyScheduleFailure:
            return 'Could not create the recurring exchange';
        case TransactionStatus.ConfirmTransactionFailure:
            return 'The transaction could not be confirmed';
        case TransactionStatus.TransactionFinished:
            return 'Operation completed';
        default:
            return '';
    }
}

export const getIntervalFromSeconds = (seconds: number, slash = false): string => {
    switch (seconds) {
        case 60:
            return slash ? ' / minute' : 'per minute';
        case 3600:
            return slash ? ' / hour' : 'per hour';
        case 86400:
            return slash ? ' / day' : 'per day';
        case 604800:
            return slash ? ' / week' : 'per week';
        case 2629750:
            return slash ? ' / month' : 'per month';
        case 31557000:
            return slash ? ' / year' : 'per year';
        default:
            return '';
    }
}

export function convertLocalDateToUTCIgnoringTimezone(date: Date) {
    const timestamp = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    );

    return new Date(timestamp);
}

export const getFairPercentForInterval = (frequency: PaymentRateType): number => {
    let value = 10;
    switch (frequency) {
        case PaymentRateType.PerMinute:
            value = 500;
            break;
        case PaymentRateType.PerHour:
            value = 100;
            break;
        case PaymentRateType.PerDay:
            value = 50;
            break;
        default:
            break;
    }
    return value / 100;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get a percentual value that partialValue represents in total
export const percentual = (partialValue: number, total: number): number => {
    return (100 * partialValue) / total;
}

/**
 * Get the given percent of total
 * @param {number} percent - The percentual value to obtain from the total amount
 * @param {number} total - The total amount to calculate a given percent of
 * @returns {number} - The resulting fraction of the total
 */
export const percentage = (percent: number, total: number): number => {
    return percent * total / 100;
}

export const maxTrailingZeroes = (original: any, zeroes = 2): string => {
    let result = '';
    let trailingZeroes = 0;
    const trailingChar = '0';
    const numericString = original.toString();
    const splitted = numericString.split('.');
    const dec = splitted[1];
    if (splitted.length === 1) {
        result = original;
    } else {
        // Count zeroes from the end
        if (dec && dec.length > zeroes) {
            for (let i = numericString.length - 1; i >= 0; i--) {
                if (numericString[i] !== '0') {
                    break;
                }
                trailingZeroes++;
            }
        }
        // If more zeroes than the wanted amount
        if (trailingZeroes > zeroes) {
            const plainNumber = parseFloat(numericString);
            result = plainNumber.toString();
            // Add the needed amount of zeroes after parsing
            if (result.indexOf('.') === -1) {
                result += '.' + trailingChar.repeat(zeroes);
            }
        } else {
            result = original; // Otherwise return the numeric string intact
        }
    }

    return result;
}

export const getFormattedNumberToLocale = (value: any, digits = 0) => {
    const converted = parseFloat(value.toString());
    const formatted = new Intl.NumberFormat('en-US', {
        minimumSignificantDigits: 1,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(converted);
    return formatted || '';
}

export const toUsCurrency = (value: any) => {
    const converted = parseFloat(value.toString());
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
    return formatted || '';
}

export const getShortDate = (date: string, includeTime = false): string => {
    if (!date) { return ''; }
    const localDate = new Date(date);
    return dateFormat(
        localDate,
        includeTime ? SIMPLE_DATE_TIME_FORMAT : SIMPLE_DATE_FORMAT
    );
}

export const getReadableDate = (date: string, includeTime = false): string => {
    if (!date) { return ''; }
    const localDate = new Date(date);
    return dateFormat(
        localDate,
        includeTime ? VERBOSE_DATE_TIME_FORMAT : VERBOSE_DATE_FORMAT
    );
}

export const getDayOfWeek = (date: Date, locale = 'en-US'): string => {
    return date.toLocaleDateString(locale, { weekday: 'long' });
}

export const isToday = (someDate: string): boolean => {
    if (!someDate) { return false; }
    const inputDate = new Date(someDate);
    const today = new Date();
    return inputDate.getDate() === today.getDate() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getFullYear() === today.getFullYear()
}

export function displayTimestamp(
    unixTimestamp: number,
    shortTimeZoneName = false
): string {
    const expireDate = new Date(unixTimestamp);
    const dateString = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(expireDate);
    const timeString = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23",
        timeZoneName: shortTimeZoneName ? "short" : "long",
    }).format(expireDate);

    return `${dateString} at ${timeString}`;
}

export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function addHours(date: Date, hours: number) {
    return new Date(date.setUTCHours(date.getUTCHours() + hours));
}

export function scrollToBottom(id: string) {
    var div = document.getElementById(id);
    if (div) {
        div.scrollTop = div.scrollHeight - div.clientHeight;
    }
}

export function cutNumber(amount: number, decimals: number) {
    const str = `${amount}`;

    return str.slice(0, str.indexOf('.') + decimals + 1);
}

// Some could prefer to call these toUiAmount and toTokenAmount instead
export const makeDecimal = (bn: BN, decimals: number): number => {
    return bn.toNumber() / Math.pow(10, decimals)
}

export const makeInteger = (num: number, decimals: number): BN => {
    const mul = Math.pow(10, decimals)
    return new BN(num * mul)
}
