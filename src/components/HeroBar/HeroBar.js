import React from 'react';
import { makeStyles } from '@mui/styles';
import {
  Box, Container, IconButton, Typography
} from '@mui/material';
import { Route, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import backIcon from 'assets/back-icon.png';

const useStyles = makeStyles((theme) => ({
  heroBar: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.common.grayLight,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    padding: '2em',
    [theme.breakpoints.down('md')]: {
      padding: '1em',
    },
  }
}));

const HeroBar = () => {
  const history = useHistory();
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.heroBar}>
      <Route path={['/qr-scan', '/display-results']}>
        <IconButton
          size="small"
          onClick={() => history.push('/')}
        >
          <img src={backIcon} alt="Back icon" style={{ height: '3rem' }} />
        </IconButton>
      </Route>

      <Container>
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Typography variant="h3" component="h2" textAlign="center" fontSize={{ xs: '1.3rem', sm: '3rem' }}>
            {t('herobar.SMART Health Card Verifier')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroBar;
