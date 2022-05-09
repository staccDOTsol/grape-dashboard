export const makeFtxPayUrl = (address: string, coin: string) => {
    const url = `https://ftx.us/pay/request?coin=${coin}&address=${address}&tag=&wallet=sol&memoIsRequired=false&memo=&allowTip=false&fixedWidth=true`;
    return url;
};