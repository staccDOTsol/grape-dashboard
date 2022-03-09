import Session from './Session';
import { GRAPE_APP_API_URL } from '../components/Tools/constants';

class UserServer {
    userServerId: string;
    userId: string;
    serverId: string;
    name: string;
    logo: string;
    twitter: string;

    constructor(data: any){
        this.userServerId = data.userServerId;
        this.userId = data.userId;
        this.serverId = data.serverId;
        this.name = data.name;
        this.logo = data.logo;
        this.twitter = data.twitter;
    }

    static async register(session: Session, serverId: string){
        try {
            if (!session) throw new Error('Invalid session');

            const token = session.token;
            const signature = token.signature;
            const address = token.address;
            const publicKey = session.publicKey;
            const userId = session.userId;
            const fromTransaction = session.fromTransaction;
            
            console.log("From Dashboard:");
            console.log(JSON.stringify({
                address,
                publicKey,
                signature,
                userId,
                fromTransaction
            }));

            const response = await fetch(`${GRAPE_APP_API_URL}/server/${serverId}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address,
                    publicKey,
                    signature,
                    userId,
                    fromTransaction
                })
            });
            const userServer = await response.json();
            return new UserServer(userServer);

        } catch (err) {
            console.log(err);
        }
    }

    static async unregister(session: Session, serverId: string){
        try {
            if (!session) throw new Error('Invalid session');

            const token = session.token;
            const signature = token.signature;
            const address = token.address;
            const publicKey = session.publicKey;
            const userId = session.userId;
            const fromTransaction = session.fromTransaction;
            
            const response = await fetch(`${GRAPE_APP_API_URL}/server/${serverId}/unregister`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address,
                    publicKey,
                    signature,
                    userId,
                    fromTransaction
                })
            });

            return true;
        } catch (err) {
            console.log(err);
        }
    }
}

export default UserServer;