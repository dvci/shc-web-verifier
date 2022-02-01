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
    backgroundColor: theme.palette.common.grayLight
  },
  link: {
    fontWeight: 700,
  }
}));

const HeroBar = () => {
  const history = useHistory();
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.heroBar}>
      <Route path={['/qr-scan', '/display-results']}>
        <IconButton
          size="small"
          onClick={() => history.push('/')}
          style={{
            position: 'absolute',
            marginTop: '2.5rem',
            marginLeft: '3rem',
          }}
        >
          <img src={backIcon} alt="Back icon" style={{ height: '3rem' }} />
        </IconButton>
      </Route>

      <Container maxWidth={false}>
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          pt={5}
          pb={4}
        >
          <Typography variant="h3" component="h2" textAlign="center">
            {t('herobar.SMART Health Card Verifier')}
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default HeroBar;
