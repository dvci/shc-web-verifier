import React from 'react';
import { makeStyles } from '@mui/styles';
import {
  Box, Container, IconButton, Typography
} from '@mui/material';
import { Route, useHistory } from 'react-router-dom';
import backIcon from 'assets/back-icon.png';

const useStyles = makeStyles((theme) => ({
  heroBar: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.common.grayLight
  },
  link: {
    fontWeight: 700,
  }
}));

const HeroBar = () => {
  const history = useHistory();
  const classes = useStyles();

  const returnToLanding = () => {
    const video = document.getElementById('video');
    if (video) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.remove();
    }
    history.push('/shc-web-verifier')
  };

  return (
    <div className={classes.heroBar}>
      <Route path={['/qr-scan', '/display-results']}>
        <IconButton
          size="small"
          onClick={returnToLanding}
          style={{
            position: 'absolute',
            marginTop: '2.5rem',
            marginLeft: '3rem',
          }}
        >
          <img src={backIcon} alt="Back icon" style={{ height: '3rem' }} />
        </IconButton>
      </Route>

      <Container maxWidth="md">
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          pt={5}
          pb={4}
        >
          <Typography variant="h3" component="h2">
            SMART Health Card Verifier
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default HeroBar;
