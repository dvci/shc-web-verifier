import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Container, Typography } from '@material-ui/core';
import logo from 'assets/mitre-logo.svg';

const useStyles = makeStyles((theme) => ({
  header: {
    color: theme.palette.primary.main,
    height: '6em',
    padding: '0.25em 0.25em',
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    objectFit: 'contain',
    height: '3.5em',
  }
}));

const Header = () => {
  const classes = useStyles();

  return (
    <header className={classes.header}>
      <Container maxWidth={false}>
        <Box display="flex" alignItems="center">
          <img src={logo} alt="Placeholder Mitre logo" style={{ width: '100px' }} />
          <Box ml={2}>
            <Typography variant="h6" component="h1">
              SMART Health Card Verifier
            </Typography>
          </Box>
        </Box>
      </Container>
    </header>
  );
};

export default Header;
