import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Container, Typography } from '@material-ui/core';

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
  const classes = useStyles();
  return (
    <div className={classes.heroBar}>
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" flexDirection="column" pt={5} pb={4}>
          <Typography variant="h3" component="h2">
            SMART Health Card Verifier
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default HeroBar;
