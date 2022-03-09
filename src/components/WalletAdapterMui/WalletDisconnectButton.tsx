import { 
    Button, 
    ButtonProps } 
from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from "../../contexts/session";
import React, { FC, MouseEventHandler, useCallback, useMemo } from 'react';
import { WalletIcon } from './WalletIcon';

export const WalletDisconnectButton: FC<ButtonProps> = ({
    color = 'primary',
    variant = 'outlined',
    children,
    disabled,
    onClick,
    ...props
}) => {
    const { session, setSession } = useSession();
    const { wallet, disconnect, disconnecting } = useWallet();
    
    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented)
                disconnect().catch(() => {
                    // Silently catch because any errors are caught by the context `onError` handler
                });
            setSession(null);
            window.location.href = "/"
        },
        [onClick, disconnect]
    );

    const content = useMemo(() => {
        if (children) return children;
        if (disconnecting) return 'Disconnecting ...';
        if (wallet) return 'Disconnect';
        return 'Disconnect Wallet';
    }, [children, disconnecting, wallet]);

    return (
        <Button
            color={color}
            variant={variant}
            onClick={handleClick}
            disabled={disabled || !wallet}
            startIcon={<WalletIcon wallet={wallet} />}
            {...props}
        >
            {content}
        </Button>
    );
};