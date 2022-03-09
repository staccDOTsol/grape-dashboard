import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

import { useSession } from "../../contexts/session";
import User from '../../models/User';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import CheckIcon from '@mui/icons-material/Check';

function getParam(param: string) {
    return new URLSearchParams(document.location.search).get(param);
}

function stringFirstLetterCapitalize(str: string){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const ConfirmationView = () => {
    const [avatar, setAvatar] = React.useState(getParam('avatar'));
    const [discordId, setDiscordId] = React.useState(getParam('discord_id'));
    const [provider, setProvider] = React.useState(getParam('provider'));
    const { session, setSession } = useSession();

    if (session && discordId && session.discordId !== discordId) {
        User.updateUser(session, discordId);
        session.discordId = discordId;
        setSession(session);
    }
    
    return (
        <React.Fragment>
            <Paper className="grape-paper-background" >
                <Box 
                    className="grape-paper" 
                    justifyContent="center"
                    sx={{ p: 2, alignItems: 'center' }}>
                    <Grid 
                        container 
                        rowSpacing={8}
                        direction="column"
                        justifyContent="center"
                        sx={{
                            alignItems:"center" }}
                        >
                            <Grid 
                                item xs={12}
                            >
                                <Typography variant="h5" gutterBottom align="center">
                                    {stringFirstLetterCapitalize(provider)} linked <CheckIcon />
                                </Typography>
                            </Grid>
                        
                        <Grid 
                            item xs={12}
                        >
                            <Box
                                height="100%"
                                justifyContent="center"
                            >
                                <AvatarGroup max={2}>
                                    <Avatar 
                                        component={Paper} 
                                        elevation={4}
                                        alt="Grape" 
                                        src="/grape_logo_simple.png"
                                        sx={{ width: 160, height: 160, bgcolor: "#444" }}
                                    />
                                    <Avatar 
                                        component={Paper} 
                                        elevation={4}
                                        alt="Avatar" 
                                        src={`https://cdn.discordapp.com/avatars/${discordId}/${avatar}?size=512`}
                                        sx={{ width: 160, height: 160, bgcolor: "#444" }}
                                    />
                                </AvatarGroup>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Button component={Link} to='/' color="primary" size="medium" variant="contained" title="Connect">Home</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </React.Fragment>
    );
}
