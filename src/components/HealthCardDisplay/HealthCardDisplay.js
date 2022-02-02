import React, { useRef } from 'react';
import {
  Box,
  Button,
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
import scanIcon from 'assets/scan-icon.png';
import exclamationRedIcon from 'assets/exclamation-red-icon.png';
import exclamationOrangeIcon from 'assets/exclamation-orange-icon.png';
import VaccineCard from 'components/VaccineCard';

const useStyles = makeStyles((theme) => ({
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
  const healthCardRef = useRef(null);

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
    <Grid container style={{ marginTop: '1rem' }}>
      <Grid item xs={12} className={topBannerStyle}>
        <Container
          maxWidth="md"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
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
        <Grid item xs={12} className={bottomBannerStyle} style={{ marginBottom: '2rem' }}>
          <Box pt={1} pb={1} style={{ marginLeft: '40%' }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="left"
              flexDirection="row"
            >
              <img
                src={checkIcon}
                alt="Bottom Banner Health Card Icon"
                style={{ height: '1.5rem', marginRight: '1rem' }}
              />
              <Typography variant="h6" className={styles.verifiedText}>
                {t('healthcarddisplay.Valid SMART Health Card')}
              </Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="left"
              flexDirection="row"
            >
              <img
                src={validPrimarySeries ? checkIcon : xIcon}
                alt="Bottom Banner Series Icon"
                style={{ height: '1.5rem', marginRight: '1rem' }}
              />
              <Typography variant="h6" className={validPrimarySeries ? styles.verifiedText : styles.unverifiedText}>
                {validPrimarySeries ? t('healthcarddisplay.Valid vaccination series') : t('healthcarddisplay.Vaccination series not valid')}
              </Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="left"
              flexDirection="row"
            >
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
      {(!patientData || !bottomBannerStyle) ? (
        <>
          <Grid item xs={6} display="flex" justifyContent="center">
            <img src={errorIllustration} alt="Error Illustration" width="100%" />
          </Grid>
          <Grid
            item
            xs={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h4" color="primary.main">
                  <Trans
                    i18nKey="healthcarddisplay.Only valid SMART Health Card QR Codes are currently supported."
                    components={[
                      <span className={styles.shcText}> SMART&reg; Health Card </span>
                    ]}
                  />
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Box mt={10}>
                  <Button
                    type="button"
                    fullWidth
                    size="large"
                    variant="contained"
                    color="secondary"
                    onClick={handleScan}
                    style={{ fontSize: '150%' }}
                  >
                    <img
                      src={scanIcon}
                      alt="Scan Icon"
                      style={{ height: '2.5rem', marginRight: '10px' }}
                    />
                    {t('healthcarddisplay.SCAN QR CODE')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <VaccineCard />
          <Grid item xs={12} style={{ marginLeft: '35%' }}>
            <Box mt={5}>
              <Button
                type="button"
                size="large"
                variant="contained"
                color="secondary"
                onClick={handleScan}
                style={{ fontSize: '150%', width: healthCardRef.current ? healthCardRef.current.offsetWidth : '35%' }}
              >
                <img
                  src={scanIcon}
                  alt="Scan Icon"
                  style={{ height: '2.5rem', marginRight: '10px' }}
                />
                {t('healthcarddisplay.SCAN QR CODE')}
              </Button>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default HealthCardDisplay;
