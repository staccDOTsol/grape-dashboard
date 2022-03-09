import React from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Stack,
  Paper, 
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import LoginIcon from '@mui/icons-material/Login';
import ParaglidingIcon from '@mui/icons-material/Paragliding';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';

import { styled } from '@mui/material/styles';

export const MembershipView = () => {
  const StyledPaperOuter = styled(Paper)({
    background: 'rgba(255, 255, 255, 0.25)',
    padding: '0.5rem 1rem',
    borderRadius: 0,
    boxShadow: 'none',
    flex: 1,
    height: '100%',
  });

  const StyledPaperInner = styled(Paper)({
    backgroundColor: '#12151C',
    padding: '1rem',
    color: 'white',
    marginBottom: '1rem',
    textAlign: 'center',
    borderRadius: '1.5rem',
    boxShadow: 'none',
    flex: 1,
    height: '100%',
    '&:last-child': {
      marginBottom: 0,
    },
  });

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const MembershipItem = () => {
    //const { className, classAlias, minToken, minTokenLP, values } = tableComparisonItemProps;
    let className = '';
    let backgroundHeader = 'linear-gradient(90deg, #545769 16.21%, #262834 81.73%)';
    if (className === 'B') {
      backgroundHeader = 'linear-gradient(90deg, #D299FF 16.21%, #B4C8FD 81.73%)';
    } else if (className === 'A') {
      backgroundHeader = 'linear-gradient(90deg, #EC0FF3 16.21%, #49AEFC 81.04%)';
    }

    return (
      <Container maxWidth="xl">
        <Grid container>
          <Grid
            item
            sx={{
              paddingTop: '1rem',
              order: { xs: 'inherit', lg: 1 },
            }}
            xs={12}
            lg={3}
          >
            <img
              alt="Grape Logo"
              loading="lazy"
              style={{ width: '100%', maxWidth: '140px' }}
            />
          </Grid>

          
        </Grid>
      </Container>
    );
  }


  return (

    <Container maxWidth="xl">
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Grid item xs={2} sm={4} md={3}>
              <Stack spacing={2}>
                <Box>

                  <Typography>
                    Membership
                  </Typography>
                </Box>
                <Box>
                  
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <CardGiftcardIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Monthly Emissions"
                        />
                      </ListItem>
                  </List>
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <EmojiEventsIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Event Prize Pools"
                        />
                      </ListItem>
                  </List>
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <WorkIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Access to Skill Role Allocation Pool"
                        />
                      </ListItem>
                  </List>
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <LoginIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Channel Access Level"
                        />
                      </ListItem>
                  </List>
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <ParaglidingIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Chance to win Airdrops/Giveaways"
                        />
                      </ListItem>
                  </List>
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <GroupsIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Governance: SubDAO Eligibility"
                        />
                      </ListItem>
                  </List>
                  <List dense={true}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Governance: MainDAO Eligibility"
                        />
                      </ListItem>
                  </List>

                </Box>
              </Stack>
            </Grid>
            <Grid item xs={2} sm={4} md={3}>
              <div>xs=2</div>
            </Grid>
            <Grid item xs={2} sm={4} md={3}>
              <div>xs=2</div>
            </Grid>
            <Grid item xs={2} sm={4} md={3}>
              <div>xs=2</div>
            </Grid>
        </Grid>
    </Container>
  )
};