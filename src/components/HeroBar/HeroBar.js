import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box, Container, IconButton, Typography
} from '@material-ui/core';
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

const HeroBar = ({ isScanning, qrCode, home }) => {
  const classes = useStyles();
  return (
    <div className={classes.heroBar}>
      {(isScanning || qrCode) && (
        <IconButton
          size="small"
          onClick={home}
          style={{
            position: 'absolute',
            marginTop: '2.5rem',
            marginLeft: '3rem',
          }}
        >
          <img src={backIcon} alt="Back icon" style={{ height: '3rem' }} />
        </IconButton>
      )}
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
