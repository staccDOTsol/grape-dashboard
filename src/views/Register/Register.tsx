import * as React from "react";
import { useEffect } from "react";
import { useParams, Link, useLocation } from 'react-router-dom';
import { useSession } from "../../contexts/session";

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { useWallet } from '@solana/wallet-adapter-react';

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import CheckIcon from '@mui/icons-material/Check';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ConnectDialog from '../../components/ConnectDialog/ConnectDialog';

function DiscordIcon(props: SvgIconProps) {
    return (
      <SvgIcon {...props}>
        <path d="M17.2,3.6C14.9,1.8,13,1.5,13,1.5l-0.2,0.3c2.8,0.9,3.7,2.5,3.7,2.5c-1.7-1-3.4-1.4-4.9-1.6
              c-1.2-0.2-2.3-0.1-3.3,0c-0.1,0-0.2,0-0.3,0C7.4,2.8,6,3,4.3,3.7c-0.6,0.3-1,0.4-1,0.4s1.1-1.6,4.1-2.4L7.1,1.5c0,0-2,0.3-4.3,2.1
              c0,0-2.3,4.3-2.3,9.5c0,0,1.4,2.3,4.9,2.4c0,0,0.4-0.4,0.9-1c-2.1-0.6-2.7-2.2-2.7-2.2s0.2,0.1,0.4,0.3c0,0,0,0,0.1,0
              c0.1,0,0.1,0.1,0.2,0.1c0.4,0.3,0.8,0.4,1.2,0.5c0.7,0.3,1.5,0.5,2.4,0.7c1.2,0.3,2.7,0.3,4.3,0c0.8-0.2,1.6-0.3,2.3-0.7
              c0.6-0.2,1.2-0.5,1.9-1c0,0-0.6,1.6-2.7,2.3c0.5,0.6,0.9,1,0.9,1c3.6-0.1,4.9-2.4,4.9-2.4C19.5,7.8,17.2,3.6,17.2,3.6z M7,11.5
              c-1,0-1.6-0.8-1.6-1.8S6.1,7.9,7,7.9s1.6,0.8,1.6,1.8S7.9,11.5,7,11.5z M13,11.5c-1,0-1.6-0.8-1.6-1.8s0.7-1.8,1.6-1.8
              s1.6,0.8,1.6,1.8S13.8,11.5,13,11.5z" />
      </SvgIcon>
    );
  }

function getQueryVariable(variable: string)
{
    var query = window.location.search.substring(1);
    if (!query)
        query = window.location.hash.substring(1);
    
    //console.log(query)//"app=article&act=news_content&aid=160990"
    var vars = query.split("&");
    //console.log(vars) //[ 'app=article', 'act=news_content', 'aid=160990' ]
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        //    console.log(pair)//[ 'app', 'article' ][ 'act', 'news_content' ][ 'aid', '160990' ] 
        if (pair[0] == '/register?'+variable){
            //console.log("+found "+variable+": "+pair[1]);
            return pair[1]
        }else if(pair[0] == variable){
            //console.log("-found "+variable+": "+pair[1]);
            return pair[1];
        }
    }
    return(false);
}

function getParam(param: string) {
    //const location = useLocation();
    //return new URLSearchParams(location.search).get(param);
    let parameter = new URLSearchParams(window.location.search).get(param);
    if (!parameter)
        parameter = new URLSearchParams(window.location.hash).get(param); // this will not return correctly because we have a ? after the hash
    //console.log(param + ': ' + parameter);
    return parameter;
}

export function RegisterView(props: any) {
    const [serverId, setServerId] = React.useState(getParam('server_id'));
    const [avatar, setAvatar] = React.useState(getParam('avatar'));
    const [discordId, setDiscordId] = React.useState(getParam('discord_id'));
    const [userId, setUserId] = React.useState(getParam('user_id'));
    const [discordUrl, setDiscordUrl] = React.useState(getParam('discord_url'));
    const [tokenParam, setTokenParam] = React.useState(getParam('token'));
    const [provider, setProvider] = React.useState(getParam('provider'));
    const [serverName, setServerName] = React.useState(decodeURIComponent(getParam('serverName')));
    const [serverLogo, setServerLogo] = React.useState(decodeURIComponent(getParam('serverLogo')));
    const [isRegistered, setIsRegistered] = React.useState((getParam('is_registered')));
    
    const { publicKey, wallet, disconnect} = useWallet();

    const { session, setSession } = useSession();
    const isConnected = session && session.isConnected;
    const isAlreadyRegistered = session?.discordId ? true : false;
    
    async function disconnectSession(redirect:boolean) {
        await disconnect().catch(() => { /* catch any errors */ });
        setSession(null);
        if (redirect)
            window.location.href = "/";
    }
    
    useEffect(() => {
        //console.log("Server ID: "+ tokenParam);
        setSession(null);
    }, [tokenParam]);

    useEffect(() => {
        //console.log("Session Wallet: "+session.isWallet);
        if (!session.isWallet){
            disconnectSession(false);
        }
    }, [session]);

    return (
        <React.Fragment>
            <Paper className="grape-paper-background" >
                <Paper className="grape-paper" sx={{ p: 2, flexDirection: 'column', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Grid 
                            container 
                            direction="column" 
                            spacing={2} 
                            alignItems="center"
                            rowSpacing={8}
                            sx={{ flexGrow: 1 }}
                        >
                            <Grid 
                                item xs={12}
                            >
                                <Typography variant="h5" gutterBottom align="center">
                                    Register Wallet with <br /> {serverName}
                                </Typography>
                            </Grid>
                            
                            <Grid 
                                item xs={12}
                            >
                                <Box
                                height="100%"
                                display="flex"
                                justifyContent="center"
                                flexDirection="column"
                                >
                                    <AvatarGroup max={2}>
                                        <Avatar 
                                            component={Paper} 
                                            elevation={4}
                                            alt="Grape" 
                                            src={`/server-logos/${serverLogo}`} 
                                            sx={{ width: 160, height: 160, bgcolor: "#444" }}
                                        />
                                        <Avatar 
                                            component={Paper} 
                                            elevation={4}
                                            alt="Discord" 
                                            src={`https://cdn.discordapp.com/avatars/${discordId}/${avatar}?size=512`} 
                                            sx={{ width: 160, height: 160, bgcolor: "#444" }}
                                        />
                                    </AvatarGroup>
                                </Box>
                            </Grid>
                            
                            {!isAlreadyRegistered ? 
                                <Grid item xs={12}>

                                    <br/>
                                    
                                    <ConnectDialog
                                        session={session}
                                        isConnected={isConnected}
                                        userId={userId}
                                        menuId='primary-wallet-account-menu'
                                        menuWalletId='primary-fullwallet-account-menu'
                                        handleProfileMenuOpen={() => {}}
                                        buttonText="Link Wallet"   
                                        nakedWallet={false}    
                                        login={false}  
                                        token={tokenParam}   
                                        discordId={discordId} 
                                    /> 
                                    
                                </Grid> 
                            : 
                                <Grid item xs={12}>
                                    {(!isConnected && !session.isWallet) ? 
                                    <div><Typography variant="h4" gutterBottom align="center">Your wallet is not connected <LinkOffIcon sx={{ ml:1 }} /></Typography>
                                        <Box textAlign="center">
                                            <ConnectDialog
                                                session={session}
                                                isConnected={isConnected}
                                                userId={userId}
                                                menuId='primary-wallet-account-menu'
                                                menuWalletId='primary-fullwallet-account-menu'
                                                handleProfileMenuOpen={() => {}}
                                                buttonText="Connect"
                                                nakedWallet={false}
                                                login={false}    
                                                token={tokenParam} 
                                                discordId={discordId} 
                                            />
                                        </Box>
                                    </div>
                                    : 
                                        <div>
                                            <Typography variant="h4" gutterBottom align="center">Your wallet has been linked <CheckIcon /></Typography>
                                            <Box textAlign="center">
                                                <ButtonGroup color="primary" aria-label="outlined primary button group">
                                                    <Button component={Link} to='/' title="Home">Home</Button>
                                                    <Button target="_blank" href={`${discordUrl}`} title="Back to Discord">Back to <DiscordIcon sx={{ ml:1 }} /></Button>
                                                </ButtonGroup>
                                            </Box>
                                        </div>
                                    }
                                </Grid>
                            }
                        </Grid>
                    </Paper>
                </Paper>
        </React.Fragment>
    );
}
