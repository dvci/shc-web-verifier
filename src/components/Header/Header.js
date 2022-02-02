import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logo from 'assets/mitre-logo.svg';

const useStyles = makeStyles((theme) => ({
  header: {
    color: theme.palette.primary.main,
    height: '6em',
    display: 'flex',
    alignItems: 'center'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  logo: {
    objectFit: 'contain',
    [theme.breakpoints.up('md')]: {
      width: '120px',
    },
    [theme.breakpoints.down('md')]: {
      width: '80px',
    },
  }
}));

const Header = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <header className={classes.header}>
      <Box className={classes.container} padding={{ xs: 2, md: 4 }}>
        <Box className={classes.logo}>
          <img src={logo} alt="Placeholder Mitre logo" style={{ width: '100%', height: '100%' }} />
        </Box>
        <Box ml={{ xs: 2, md: 4 }}>
          <Typography variant="h6" component="h1">
            {t('header.SMART Health Card Verifier')}
          </Typography>
        </Box>
      </Box>
    </header>
  );
};

export default Header;
