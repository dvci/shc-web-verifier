import React from 'react';
import { makeStyles } from '@mui/styles';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logo from 'assets/mitre-logo.svg';

const useStyles = makeStyles((theme) => ({
  header: {
    color: theme.palette.primary.main,
    height: '6em',
    padding: '0.25em 0.25em',
    display: 'flex',
    alignItems: 'center'
  },
  container: {
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  logo: {
    objectFit: 'contain',
    height: '3.5em',
  }
}));

const Header = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <header className={classes.header}>
      <Grid
        container
        className={classes.container}
        spacing={{
          xs: 1, sm: 2, md: 3
        }}
      >
        <Grid item>
          <img src={logo} alt="Placeholder Mitre logo" style={{ width: '100px' }} />
        </Grid>
        <Grid item>
          <Typography variant="h6" component="h1">
            {t('header.SMART Health Card Verifier')}
          </Typography>
        </Grid>
      </Grid>
    </header>
  );
};

export default Header;
