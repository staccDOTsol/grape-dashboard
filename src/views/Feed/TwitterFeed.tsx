import React, { useEffect, useState } from 'react';

import {
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Timeline } from 'react-twitter-widgets'
//import { TwitterTimelineEmbed } from 'react-twitter-embed';

//class ShowTwitterFeed extends React.Component {

function ShowTwitterFeed(props:any){  
  /*
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    document.getElementsByClassName("twitter-embed")[0].appendChild(script);
  }, []);

  return (
    
      <section className="twitterContainer">
        <div className="twitter-embed">
          <a
            className="twitter-timeline"
            data-theme="dark"
            data-tweet-limit="5"
            data-chrome="noheader nofooter noborders, transparent"
            //height="400" //{props.twitterFeedHeight}""
            href="https://twitter.com/grapeprotocol"//</div>+{props.twitterFeedHandle}
          >
            Tweets by {props.twitterFeedHandle}
          </a>
        </div>
      </section>
  );
  */
  //return <>Nothing to see here anymore!</>;
  
  return (
    <React.StrictMode>
      <Timeline
        dataSource={{
          sourceType: 'profile',
          screenName: props.twitterFeedHandle
        }}
        options={{
          height: props.twitterFeedHeight,//'400',
          chrome:'transparent, noheader, nofooter',
          //dnt: true, 
          theme: 'dark',
          borderColor: 'transparent'
        }}
      />
    </React.StrictMode>
  );
}

export default function TwitterFeedComponent(props:any) {
  //const theme = useTheme();
  const title = props.title;
  const twitterFeedHandle = props.twitterFeedHandle;
  const twitterFeedHeight = props.twitterFeedHeight;
  const componentTwitterFeed = props.componentTwitterFeed;
  const componentExpanded = props.componetExpanded;
  // make collapsable component
  const [expanded, setExpanded] = React.useState(componentExpanded);

    if (componentTwitterFeed){
      return (
        <Grid item xs={12} md={6} lg={6}>
            <Paper elevation={0} className="grape-blur-bg">
              <Accordion expanded={true} className="grape-blur" TransitionProps={{ unmountOnExit: true }}>
                {title &&
                  <Box>
                      <AccordionSummary
                        //expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        
                      <Typography gutterBottom variant="h6" component="div" sx={{ m: 0, position: 'relative'}}>
                            {title}
                      </Typography>
                    </AccordionSummary>
                    
                  </Box>
                }
                <AccordionDetails>
                  <ShowTwitterFeed twitterFeedHandle={twitterFeedHandle} twitterFeedHeight={twitterFeedHeight} />
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
      );
    } else {
      return (
        <Paper>
          {title &&
            <Box>
                <Typography gutterBottom variant="h6" component="div" sx={{ m: 0, position: 'relative'}}>
                      {title}
                </Typography>
            </Box>
          }
            <ShowTwitterFeed twitterFeedHandle={twitterFeedHandle} twitterFeedHeight={twitterFeedHeight} />
        </Paper>
      );
  }
            
}