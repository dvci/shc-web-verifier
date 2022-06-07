import React, { useEffect, useState } from 'react';
import {
  Link,
  HashRouter as Router,
  useHistory,
} from 'react-router-dom';
import {
  Box, Container, Grid, Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useQrDataContext } from 'components/QrDataProvider';
import { useHealthCardDataContext, HealthCardDataProvider } from 'components/HealthCardDataProvider';
import { useTranslation, Trans } from 'react-i18next';
import errorIllustration from 'assets/error-illustration.png';
import checkIcon from 'assets/check-icon.png';
import xIcon from 'assets/x-icon.png';
import exclamationRedIcon from 'assets/exclamation-red-icon.png';
import exclamationOrangeIcon from 'assets/exclamation-orange-icon.png';
import VaccineCard from 'components/VaccineCard';
import QrScanButton from 'components/QrScanButton';
import { ErrorBoundary } from 'react-error-boundary';

const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'center'
  },
  bannerRoot: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    fontSize: { xs: '1.3rem', sm: '3rem' },
    marginTop: '1rem',
    marginBottom: '1rem',
    flexWrap: 'nowrap'
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  flexCol: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexDirection: 'column'
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
      width: '650px'
    }
  },
  errorRoot: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row'
    }
  },
  errorGrid: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '1rem',
    [theme.breakpoints.down('md')]: {
      padding: '1rem'
    },
    [theme.breakpoints.up('md')]: {
      padding: '2rem'
    }
  },
  bannerError: {
    backgroundColor: theme.palette.common.redLight,
    color: theme.palette.common.redDark
  },
  topBannerLoading: {
    backgroundColor: theme.palette.common.grayLight,
    color: theme.palette.common.black
  },
  topBannerValid: {
    backgroundColor: theme.palette.common.greenLight,
    color: theme.palette.common.greenDark
  },
  bottomBannerValid: {
    backgroundColor: theme.palette.common.greenLighter,
    color: theme.palette.common.greenDark
  },
  topBannerPartial: {
    backgroundColor: theme.palette.common.orangeLight,
    color: theme.palette.common.orangeDark
  },
  bottomBannerPartial: {
    backgroundColor: theme.palette.common.orangeLighter,
    color: theme.palette.common.orangeDark
  },
  verifiedText: {
    color: theme.palette.common.greenDark
  },
  unverifiedText: {
    color: theme.palette.common.redDark
  },
  shcText: {
    color: theme.palette.secondary.main
  }
}));

const HealthCardDisplay = () => {
  const styles = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const { qrError, jws, matchingDemographicData } = useQrDataContext();
  const [bannersUpdated, setBannersUpdated] = useState(false);

  const handleScan = (propertyName) => {
    history.push({ pathname: 'qr-scan', state: propertyName })
  };

  const TopBanner = ({
    img, alt, style, text
  }) => (
    <Grid item xs={12} className={style} width="100%">
      <Container style={{ width: 'fit-content' }}>
        <Box className={styles.flexRow} pt={2} pb={2}>
          {img && <img src={img} alt={alt} style={{ height: '2rem', marginRight: '1rem' }} />}
          <Typography variant="h4">{text}</Typography>
        </Box>
      </Container>
    </Grid>
  );

  const ErrorFallback = ({ error }) => {
    let bannerErrorText;
    let userErrorText;

    // Set banner text and default user error text
    if (error.message.startsWith('UNVERIFIED')) {
      bannerErrorText = 'Not verified';
      userErrorText = 'This SMART Health Card cannot be verified.';
    } else if (error.message.startsWith('UNSUPPORTED')) {
      bannerErrorText = 'Invalid SMART Health Card';
      userErrorText = 'Only valid SMART Health Card QR codes are currently supported.';
    } else {
      throw error;
    }

    // Set specific user error text
    switch (error.message) {
      case 'UNVERIFIED_ERROR_RETRIEVING_KEY_URL':
        userErrorText = 'Unable to verify SMART Health Card issuer. Please check internet access and try again later.';
        break;
      case 'UNSUPPORTED_MALFORMED_CREDENTIAL':
        userErrorText = 'Only valid SMART Health Card QR codes are currently supported. Please contact the issuer of your Health Card for assistance.';
        break;
      case 'UNSUPPORTED_HEALTH_CARD':
        userErrorText = 'Only SMART Health Cards containing immunizations are currently supported.';
        break;
      default:
        // Do nothing.
    }

    const bannerError = t(`healthcarddisplay.${bannerErrorText}`)
    const userError = (
      <Trans
        i18nKey={`healthcarddisplay.${userErrorText}`}
        components={[
          <span className={styles.shcText}> SMART&reg; Health Card </span>
        ]}
      />
    );

    return (
      <>
        <Grid container className={styles.bannerRoot}>
          <TopBanner img={exclamationRedIcon} alt="Banner Icon" style={styles.bannerError} text={bannerError} />
        </Grid>
        <Grid container className={styles.errorRoot}>
          <Grid item md={6} display="flex" justifyContent="center">
            <img src={errorIllustration} alt="Error Illustration" width="100%" />
          </Grid>
          <Grid item container md={6} className={styles.errorGrid} rowSpacing={{ xs: '1rem', md: '2rem' }}>
            <Grid item>
              <Typography textAlign="center" variant="h4" color="primary.main">
                {userError}
              </Typography>
            </Grid>
            <Grid item>
              <QrScanButton onClick={handleScan} styles={{ width: '100%' }} mt={10} />
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  };

  const Banners = () => {
    const { healthCardSupported, healthCardVerified, issuerVerified } = useHealthCardDataContext();
    const { validationStatus } = useQrDataContext();

    useEffect(() => {
      setBannersUpdated(false);
      if (healthCardVerified.error) {
        throw healthCardVerified.error;
      } else if (healthCardSupported.error) {
        throw healthCardSupported.error;
      } else if (healthCardVerified.verified !== null && !healthCardVerified.verified) {
        throw new Error('UNVERIFIED');
      }

      if (healthCardSupported.status !== null && healthCardVerified.verified !== null) {
        // Signal that vaccine card should be displayed
        setBannersUpdated(true);
      }
    }, [healthCardSupported.error,
      healthCardSupported.status,
      healthCardVerified.error,
      healthCardVerified.verified]);

    const BottomBanner = ({
      img, alt, style, text
    }) => (
      <Box className={styles.flexRow}>
        <img src={img} alt={alt} style={{ height: '1.5rem', marginRight: '1rem' }} />
        <Typography variant="h6" className={style}>
          {text}
        </Typography>
      </Box>
    );

    return (
      <Grid container className={styles.bannerRoot}>
        {healthCardSupported.status !== null && healthCardVerified.verified !== null ? (
          <>
            {healthCardVerified.verified && issuerVerified ? (
              <TopBanner
                img={checkIcon}
                alt="Banner Icon"
                style={styles.topBannerValid}
                text={t('healthcarddisplay.Verified')}
              />
            ) : (
              <TopBanner
                img={exclamationOrangeIcon}
                alt="Banner Icon"
                style={styles.topBannerPartial}
                text={t('healthcarddisplay.Partially Verified')}
              />
            )}
            <Grid
              item
              xs={12}
              className={
                healthCardVerified.verified && issuerVerified
                  ? styles.bottomBannerValid : styles.bottomBannerPartial
              }
              style={{
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <Box pt={1} pb={1} className={styles.flexCol} width="fit-content">
                <BottomBanner
                  img={checkIcon}
                  alt="Bottom Banner Health Card Icon"
                  style={styles.verifiedText}
                  text={t('healthcarddisplay.Valid SMART Health Card')}
                />
                {validationStatus?.validPrimarySeries != null && (
                  <BottomBanner
                    img={validationStatus.validPrimarySeries ? checkIcon : xIcon}
                    alt="Bottom Banner Series Icon"
                    style={validationStatus.validPrimarySeries
                      ? styles.verifiedText : styles.unverifiedText}
                    text={
                      validationStatus.validPrimarySeries
                        ? t('healthcarddisplay.Valid vaccination series')
                        : t('healthcarddisplay.Cannot determine vaccination status')
                    }
                  />
                )}
                <BottomBanner
                  img={issuerVerified ? checkIcon : xIcon}
                  alt="Bottom Banner Issuer Icon"
                  style={issuerVerified ? styles.verifiedText : styles.unverifiedText}
                  text={
                    issuerVerified
                      ? t('healthcarddisplay.Issuer recognized')
                      : t('healthcarddisplay.Issuer not recognized')
                  }
                />
              </Box>
            </Grid>
          </>
        ) : (
          // Show loading banner and hide vaccine card while banners update
          <TopBanner style={styles.topBannerLoading} text={t('healthcarddisplay.Verifying Health Card')} />
        )}
      </Grid>
    );
  };

  return (
    <Grid container className={styles.root}>
      {(qrError)
        ? (
          <ErrorFallback error={qrError} />
        ) : (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <HealthCardDataProvider healthCardJws={jws[jws.length - 1]}>
              <Banners />
            </HealthCardDataProvider>
            <Grid item className={styles.flexCard}>
              <Box style={{ textAlign: 'center' }}>
                {
                  (matchingDemographicData) ? '' : (
                    t('Name and/or date of birth are not consistent across all scanned cards. Verify that these cards are for the same person.')) 
                }
                <Router>
                  <Link
                    to="/qr-scan"
                    state="link"
                    replace
                    onClick={() => handleScan('link')}
                  >
                    {t(
                      'healthcarddisplay.Add another SMART Health Card for same person'
                    )}
                  </Link>
                </Router>
              </Box>
              {bannersUpdated && (
                <>
                  {
                    // Display cards in reverse order that they were scanned
                    jws.slice(0).reverse().map((hcJws) => (
                      <HealthCardDataProvider key={Math.random()} healthCardJws={hcJws}>
                        <Box m={2}>
                          <VaccineCard padding="1rem" width="100%" />
                        </Box>
                      </HealthCardDataProvider>
                    ))
                  }
                  <QrScanButton onClick={() => handleScan('qr-button')} styles={{ padding: '1rem', width: '100%' }} />
                </>
              )}
            </Grid>
          </ErrorBoundary>
        )}
    </Grid>
  );
};

export default HealthCardDisplay;
