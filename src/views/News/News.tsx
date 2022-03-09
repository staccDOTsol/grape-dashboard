import * as React from 'react';

import {
    Typography,
    Grid
} from '@mui/material';

import TwitterFeedComponent from '../Feed/TwitterFeed';

interface NewsViewProps {
  children?: React.ReactNode;
}

export function NewsView(props: NewsViewProps) {
//export default function UnlistedOffersView(props: any) {
  
  

  return (
    <React.Fragment>
        <div style={{ height: "100%", overflow: "auto" }}>
            <Grid container spacing={3}>
                <TwitterFeedComponent title={'Grape News'} twitterFeedHandle={'grapeprotocol'} twitterFeedHeight={800} twitterFeedElements={2} componentTwitterFeed={true} componentExpanded={true}/>
                <TwitterFeedComponent title={'Solana News'} twitterFeedHandle={'solana'} twitterFeedHeight={800} twitterFeedElements={2} componentTwitterFeed={true} componentExpanded={true} />
                <TwitterFeedComponent title={'Grape Events'} twitterFeedHandle={'eventsgrape'} twitterFeedHeight={800} twitterFeedElements={2} componentTwitterFeed={true} componentExpanded={true} />
            </Grid>
        </div>
    </React.Fragment>
);
}