import React from 'react';
import {
  Box, Button, Link, Typography, useTheme, useMediaQuery
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import checkIcon from 'assets/check-icon.png';
import qrIllustration from 'assets/qr-code-illustration.png';
import qrIcon from 'assets/qr-vaccine-icon.png';
import scanIcon from 'assets/scan-icon.png';
import { useTranslation, Trans } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  landing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row'
    }
  },
  boxqrillustration: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '650px',
    [theme.breakpoints.up('md')]: {
      width: '650px'
    }
  },
  logo: {
    objectFit: 'contain',
    height: '3.5em'
  }
}));

const Landing = () => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const theme = useTheme();
  const singleCol = useMediaQuery(theme.breakpoints.down('md'));

  const handleScan = () => {
    history.push('qr-scan');
  };

  const BoxQrIllustration = () => (
    <Box className={classes.boxqrillustration}>
      <img src={qrIllustration} alt="Scan QR Code" style={{ width: '100%', height: '100%' }} />
    </Box>
  );

  return (
    <Box className={classes.landing}>
      {!singleCol && BoxQrIllustration()}
      <Box display="flex" flexDirection="column" sx={{ maxWidth: '750px' }} width="100%" alignItems="center">
        <Box display="flex" flexDirection="row">
          <img src={qrIcon} alt="QR Vaccine Icon" style={{ height: '5rem' }} />
          <Typography variant="h6" style={{ marginTop: '5px', marginLeft: '25px' }}>
            <Trans
              i18nKey="landing.Verify a SMART Health Card QR code in a safe and privacy-preserving way."
              components={[<Link href="https://smarthealth.cards/" color="secondary" target="_blank" rel="noopener" />]}
            />
          </Typography>
        </Box>
        {singleCol && BoxQrIllustration()}
        <Box width="inherit" mt={{ xs: 4, md: 10 }}>
          <Button
            type="button"
            fullWidth
            size="large"
            variant="contained"
            color="secondary"
            onClick={handleScan}
            style={{ fontSize: '150%' }}
          >
            <img src={scanIcon} alt="Scan Icon" style={{ height: '2.5rem', marginRight: '10px' }} />
            {t('landing.SCAN QR CODE')}
          </Button>
        </Box>
        <Box width="inherit" mt={{ xs: 4, md: 10 }}>
          <Typography variant="h6">{t('landing.What is a SMART Health Card?')}</Typography>
          <Typography>
            <img src={checkIcon} alt="Check Icon" style={{ height: '1rem', marginRight: '10px' }} />
            {t('landing.Holds important vaccination or lab report data.')}
          </Typography>
          <Typography>
            <img src={checkIcon} alt="Check Icon" style={{ height: '1rem', marginRight: '10px' }} />
            {t('landing.Can be scanned to verify that the information has not been tampered with.')}
          </Typography>
        </Box>
        <Box width="inherit" mt={{ xs: 2, md: 5 }}>
          <Typography>
            <Trans
              i18nKey="landing.For more information on SMART Health Cards, please visit"
              values={{ url: 'https://smarthealth.cards/' }}
              components={[
                <Link href="https://smarthealth.cards/" color="secondary" target="_blank" rel="noopener">
                  https://smarthealth.cards/
                </Link>
              ]}
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
