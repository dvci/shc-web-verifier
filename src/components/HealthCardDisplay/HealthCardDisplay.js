import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
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
    jws,
    validationStatus,
  } = useQrDataContext();

  const handleScan = () => {
    history.push('qr-scan');
  };

  const Banners = ({ cardJws, cardsValidPrimarySeries }) => {
    const {
      setJws,
      healthCardSupported,
      healthCardVerified,
      issuerVerified,
    } = useHealthCardDataContext();
    const [topBannerStyle, setTopBannerStyle] = useState(null);
    const [topBannerIcon, setTopBannerIcon] = useState(null);
    const [topBannerText, setTopBannerText] = useState(null);
    const [bottomBannerStyle, setBottomBannerStyle] = useState(null);

    useEffect(() => {
      setJws(cardJws);
    }, [cardJws, setJws]);

    useEffect(() => {
      if (!healthCardSupported.status) {
        setTopBannerStyle(styles.bannerError);
        setTopBannerIcon(exclamationRedIcon);
        setTopBannerText(t('healthcarddisplay.Invalid SMART Health Card'));
      } else if (!healthCardVerified.verified && healthCardVerified.error) {
        setTopBannerStyle(styles.bannerError);
        setTopBannerIcon(exclamationRedIcon);
        setTopBannerText(t('healthcarddisplay.Not verified'));
      } else if (healthCardVerified.verified && issuerVerified) {
        setTopBannerStyle(styles.topBannerValid);
        setTopBannerIcon(checkIcon);
        setTopBannerText(t('healthcarddisplay.Verified'));
        setBottomBannerStyle(styles.bottomBannerValid);
      } else {
        setTopBannerStyle(styles.topBannerPartial);
        setTopBannerIcon(exclamationOrangeIcon);
        setTopBannerText(t('healthcarddisplay.Partially Verified'));
        setBottomBannerStyle(styles.bottomBannerPartial);
      }
    }, [healthCardSupported.status, healthCardVerified.error,
      healthCardVerified.verified, issuerVerified]);

    const TopBanner = ({
      img, alt, style, text
    }) => (
      <Grid item xs={12} className={style} width="100%">
        <Container style={{ width: 'fit-content' }}>
          <Box
            className={styles.flexRow}
            pt={2}
            pb={2}
          >
            <img
              src={img}
              alt={alt}
              style={{ height: '2rem', marginRight: '1rem' }}
            />
            <Typography variant="h4">
              {text}
            </Typography>
          </Box>
        </Container>
      </Grid>
    );

    const BottomBanner = ({
      img, alt, style, text
    }) => (
      <Box className={styles.flexRow}>
        <img
          src={img}
          alt={alt}
          style={{ height: '1.5rem', marginRight: '1rem' }}
        />
        <Typography variant="h6" className={style}>
          {text}
        </Typography>
      </Box>
    );

    return (
      <Grid container className={styles.bannerRoot}>
        <TopBanner
          img={topBannerIcon}
          alt="Banner Icon"
          style={topBannerStyle}
          text={topBannerText}
        />
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
            <BottomBanner
              img={checkIcon}
              alt="Bottom Banner Health Card Icon"
              style={styles.verifiedText}
              text={t('healthcarddisplay.Valid SMART Health Card')}
            />
            <BottomBanner
              img={cardsValidPrimarySeries ? checkIcon : xIcon}
              alt="Bottom Banner Series Icon"
              style={cardsValidPrimarySeries ? styles.verifiedText : styles.unverifiedText}
              text={cardsValidPrimarySeries ? t('healthcarddisplay.Valid vaccination series') : t('healthcarddisplay.Cannot determine vaccination status')}
            />
            <BottomBanner
              img={issuerVerified ? checkIcon : xIcon}
              alt="Bottom Banner Issuer Icon"
              style={issuerVerified ? styles.verifiedText : styles.unverifiedText}
              text={issuerVerified ? t('healthcarddisplay.Issuer recognized') : t('healthcarddisplay.Issuer not recognized')}
            />
          </Box>
        </Grid>
        )}
      </Grid>
    );
  };

  const Content = ({ cardJws }) => {
    const {
      setJws,
      healthCardSupported,
      healthCardVerified,
    } = useHealthCardDataContext();

    useEffect(() => {
      setJws(cardJws);
    }, [cardJws, setJws]);

    return (
      <>
        {(!healthCardSupported.status || (!healthCardVerified.verified && healthCardVerified.error))
          ? (
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
      </>
    );
  };

  return (
    <Grid container className={styles.root}>
      <HealthCardDataProvider>
        <Banners cardJws={jws} cardsValidPrimarySeries={validationStatus.validPrimarySeries} />
        <Content cardJws={jws} />
      </HealthCardDataProvider>
    </Grid>
  );
};

export default HealthCardDisplay;
