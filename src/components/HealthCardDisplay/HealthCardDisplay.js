import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useQrDataContext } from 'components/QrDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation, Trans } from 'react-i18next';
import errorIllustration from 'assets/error-illustration.png';
import checkIcon from 'assets/check-icon.png';
import xIcon from 'assets/x-icon.png';
import exclamationRedIcon from 'assets/exclamation-red-icon.png';
import exclamationOrangeIcon from 'assets/exclamation-orange-icon.png';
import VaccineCard from 'components/VaccineCard';
import QrScanButton from 'components/QrScanButton';

const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'center',
  },
  bannerRoot: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    fontSize: { xs: '1.3rem', sm: '3rem' },
    marginTop: '1rem',
    marginBottom: '1rem',
    flexWrap: 'nowrap',
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  flexCol: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  flexCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '1rem',
    maxWidth: '750px',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '650px',
    },
  },
  errorRoot: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  errorGrid: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '1rem',
    [theme.breakpoints.down('md')]: {
      padding: '1rem',
    },
    [theme.breakpoints.up('md')]: {
      padding: '2rem',
    },
  },
  bannerError: {
    backgroundColor: theme.palette.common.redLight,
    color: theme.palette.common.redDark,
  },
  topBannerValid: {
    backgroundColor: theme.palette.common.greenLight,
    color: theme.palette.common.greenDark,
  },
  bottomBannerValid: {
    backgroundColor: theme.palette.common.greenLighter,
    color: theme.palette.common.greenDark,
  },
  topBannerPartial: {
    backgroundColor: theme.palette.common.orangeLight,
    color: theme.palette.common.orangeDark,
  },
  bottomBannerPartial: {
    backgroundColor: theme.palette.common.orangeLighter,
    color: theme.palette.common.orangeDark,
  },
  verifiedText: {
    color: theme.palette.common.greenDark,
  },
  unverifiedText: {
    color: theme.palette.common.redDark,
  },
  shcText: {
    color: theme.palette.secondary.main,
  },
}));

const HealthCardDisplay = () => {
  const styles = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const {
    qrCodes,
    healthCardVerified,
    issuerVerified,
    validPrimarySeries,
  } = useQrDataContext();
  const patientData = getPatientData(qrCodes);

  const handleScan = () => {
    history.push('qr-scan');
  };

  let topBannerStyle;
  let topBannerIcon;
  let topBannerText;
  let bottomBannerStyle;
  if (!patientData) {
    topBannerStyle = styles.bannerError;
    topBannerIcon = exclamationRedIcon;
    topBannerText = t('healthcarddisplay.Invalid SMART Health Card');
  } else if (!healthCardVerified.verified && healthCardVerified.error) {
    topBannerStyle = styles.bannerError;
    topBannerIcon = exclamationRedIcon;
    topBannerText = t('healthcarddisplay.Not verified');
  } else if (healthCardVerified.verified && issuerVerified) {
    topBannerStyle = styles.topBannerValid;
    topBannerIcon = checkIcon;
    topBannerText = t('healthcarddisplay.Verified');
    bottomBannerStyle = styles.bottomBannerValid;
  } else {
    topBannerStyle = styles.topBannerPartial;
    topBannerIcon = exclamationOrangeIcon;
    topBannerText = t('healthcarddisplay.Partially Verified');
    bottomBannerStyle = styles.bottomBannerPartial;
  }

  return (
    <Grid container className={styles.root}>
      <Grid container className={styles.bannerRoot}>
        <Grid item xs={12} className={topBannerStyle} width="100%">
          <Container style={{ width: 'fit-content' }}>
            <Box
              className={styles.flexRow}
              pt={2}
              pb={2}
            >
              <img
                src={topBannerIcon}
                alt="Banner Icon"
                style={{ height: '2rem', marginRight: '1rem' }}
              />
              <Typography variant="h4">
                {topBannerText}
              </Typography>
            </Box>
          </Container>
        </Grid>
        {bottomBannerStyle && (
          <Grid
            item
            xs={12}
            className={bottomBannerStyle}
            style={{
              marginBottom: '2rem', display: 'flex', justifyContent: 'center', width: '100%'
            }}
          >
            <Box pt={1} pb={1} className={styles.flexCol} width="fit-content">
              <Box className={styles.flexRow}>
                <img
                  src={checkIcon}
                  alt="Bottom Banner Health Card Icon"
                  style={{ height: '1.5rem', marginRight: '1rem' }}
                />
                <Typography variant="h6" className={styles.verifiedText}>
                  {t('healthcarddisplay.Valid SMART Health Card')}
                </Typography>
              </Box>
              {(validPrimarySeries !== null) ? (
                <Box className={styles.flexRow}>
                  <img
                    src={validPrimarySeries ? checkIcon : xIcon}
                    alt="Bottom Banner Series Icon"
                    style={{ height: '1.5rem', marginRight: '1rem' }}
                  />
                  <Typography variant="h6" className={validPrimarySeries ? styles.verifiedText : styles.unverifiedText}>
                    {validPrimarySeries ? t('healthcarddisplay.Valid vaccination series') : t('healthcarddisplay.Cannot determine vaccination status')}
                  </Typography>
                </Box>
              ) : (
                <></>
              )}
              <Box className={styles.flexRow}>
                <img
                  src={issuerVerified ? checkIcon : xIcon}
                  alt="Bottom Banner Issuer Icon"
                  style={{ height: '1.5rem', marginRight: '1rem' }}
                />
                <Typography variant="h6" className={issuerVerified ? styles.verifiedText : styles.unverifiedText}>
                  {issuerVerified ? t('healthcarddisplay.Issuer recognized') : t('healthcarddisplay.Issuer not recognized')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
      {(!patientData || !bottomBannerStyle) ? (
        <Grid container className={styles.errorRoot}>
          <Grid item md={6} display="flex" justifyContent="center">
            <img src={errorIllustration} alt="Error Illustration" width="100%" />
          </Grid>
          <Grid item container md={6} className={styles.errorGrid} rowSpacing={{ xs: '1rem', md: '2rem' }}>
            <Grid item>
              <Typography textAlign="center" variant="h4" color="primary.main">
                <Trans
                  i18nKey="healthcarddisplay.Only valid SMART Health Card QR Codes are currently supported."
                  components={[
                    <span className={styles.shcText}> SMART&reg; Health Card </span>
                  ]}
                />
              </Typography>
            </Grid>
            <Grid item>
              <QrScanButton onClick={handleScan} styles={{ width: '100%' }} mt={10} />
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid item className={styles.flexCard}>
          <VaccineCard padding="1rem" width="100%" />
          <QrScanButton onClick={handleScan} styles={{ padding: '1rem', width: '100%' }} />
        </Grid>
      )}
    </Grid>
  );
};

export default HealthCardDisplay;
