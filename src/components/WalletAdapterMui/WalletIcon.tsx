import{
    makeStyles,
} from '@mui/styles';
import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';

const useStyles = makeStyles({
    root: {
        width: "24px",
        height: "24px",
    },
});

export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet: Wallet | null;
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet, ...props }) => {
    const styles = useStyles();

    return wallet && <img src={wallet.icon} alt={`${wallet.name} icon`} className={styles.root} {...props} />;
};