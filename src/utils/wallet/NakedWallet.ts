import Session from '../../models/Session';

export const NakedWallet = (props: any, session: any) => {
    //console.log("Wallet NProp: "+props);
    
    try {
        const walletid = props;
        
        session.userId = walletid;
        session.publicKey = walletid;
        session.isConnected = true;
        session.isWallet = false;
        //return setSession(session);
        return new Session(session);
    } catch (e) {
        console.warn(e);
    }
}


export default NakedWallet;