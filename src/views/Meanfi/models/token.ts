import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey, TokenAmount } from "@solana/web3.js";
import { NATIVE_SOL_MINT } from "../helpers/ids";

export class AccountTokenParsedInfo {
    parsedInfo!: TokenAccountInfo;
    pubkey!: PublicKey;
}

export type TokenAccountInfo = {
    mint: string;
    owner: string;
    tokenAmount: TokenAmount;
    state: string;
    isNative: boolean;
};

export const NATIVE_SOL: TokenInfo = {
    symbol: 'SOL',
    name: 'Native SOL',
    address: NATIVE_SOL_MINT.toString(),
    decimals: 9,
    chainId: 101,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    tags: ['raydium']
}
