import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useHistory } from 'react-router-dom';
import { useQrDataContext } from 'components/QrDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation, Trans } from 'react-i18next';
import errorIllustration from 'assets/error-illustration.png';
import checkIcon from 'assets/check-icon.png';
import xIcon from 'assets/x-icon.png';
import scanIcon from 'assets/scan-icon.png';
import exclamationRedIcon from 'assets/exclamation-red-icon.png';
import exclamationOrangeIcon from 'assets/exclamation-orange-icon.png';
import useStyles from './styles';
import { fetchTradenames, fetchCvx } from './iisstandards';

const HealthCardDisplay = () => {
  const styles = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const {
    qrCodes,
    healthCardVerified,
    issuerVerified,
    issuerDisplayName,
    validPrimarySeries,
  } = useQrDataContext();
  const patientData = getPatientData(qrCodes);
  const [tradenames, setTradenames] = useState({});
  const [cvxCodes, setCvxCodes] = useState({});
  const [showDateOfBirth, setShowDateOfBirth] = useState(false);
  const healthCardRef = useRef(null);

  const handleScan = () => {
    history.push('qr-scan');
  };

  React.useEffect(() => {
    async function getTradenames() {
      const tn = await fetchTradenames();
      setTradenames(tn);
    }

    async function getCvx() {
      const cvx = await fetchCvx();
      setCvxCodes(cvx);
    }

    getTradenames();
    getCvx();
  }, []);

  const toggleShowDateOfBirth = () => {
    setShowDateOfBirth(!showDateOfBirth);
  };

  const immunizationDisplayName = (codings) => {
    if (codings.length === 0) return '';

    const coding = codings[0];

    if (!tradenames[coding.code]) {
      if (!cvxCodes[coding.code]) {
        return coding.system ? `${coding.system}#${coding.code}` : coding.code;
      }
      return cvxCodes[coding.code];
    }
    return tradenames[coding.code];
  };

  const HealthCardVaccination = ({ immunization }) => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      className={styles.group8}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        alignSelf="flex-end"
        className={styles.group7}
      >
        <Divider className={styles.line2} variant="middle" />
      </Box>
      <Grid container columnSpacing={{ xs: 1, sm: 1, md: 3 }}>
        <Grid item xs={3} className={styles.gridLabel}>
          <Typography>{t('healthcarddisplay.Vaccine')}</Typography>
        </Grid>
        <Grid item xs={9} className={styles.gridItem}>
          <Typography>
            <Box component="span" fontWeight="700">
              {immunization.vaccineCode
                ? immunizationDisplayName(immunization.vaccineCode.coding)
                : ''}
            </Box>
            {immunization.lotNumber
              && ` ${t('healthcarddisplay.Lot')} #${immunization.lotNumber}`}
          </Typography>
        </Grid>
        <Grid item xs={3} className={styles.gridLabel}>
          <Typography>{t('healthcarddisplay.Date')}</Typography>
        </Grid>
        <Grid item xs={8} className={styles.gridItem}>
          <Typography className={styles.date}>
            {immunization.occurrenceDateTime}
          </Typography>
        </Grid>
        <Grid item xs={3} className={styles.gridLabel}>
          <Typography>{t('healthcarddisplay.Vaccinator')}</Typography>
        </Grid>
        <Grid item xs={9} className={styles.gridItem}>
          {immunization.performer && immunization.performer.length > 0 && (
            <Typography>{immunization.performer[0].actor.display}</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );

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
        <Container maxWidth="md">
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
            <Typography variant="h4">{topBannerText}</Typography>
          </Box>
        </Container>
      </Grid>
      {bottomBannerStyle && (
        <Grid
          item
          xs={12}
          className={bottomBannerStyle}
          style={{ marginBottom: '2rem' }}
        >
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
              <Typography
                variant="h6"
                className={
                  validPrimarySeries
                    ? styles.verifiedText
                    : styles.unverifiedText
                }
              >
                {validPrimarySeries
                  ? t('healthcarddisplay.Valid vaccination series')
                  : t('healthcarddisplay.Vaccination series not valid')}
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
              <Typography
                variant="h6"
                className={
                  issuerVerified ? styles.verifiedText : styles.unverifiedText
                }
              >
                {issuerVerified
                  ? t('healthcarddisplay.Issuer recognized')
                  : t('healthcarddisplay.Issuer not recognized')}
              </Typography>
            </Box>
          </Box>
        </Grid>
      )}
      {!patientData || !bottomBannerStyle ? (
        <>
          <Grid item xs={6} display="flex" justifyContent="center">
            <img
              src={errorIllustration}
              alt="Error Illustration"
              width="100%"
            />
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
                      <span className={styles.shcText}>
                        {' '}
                        SMART&reg; Health Card
                        {' '}
                      </span>,
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
          <Grid item xs={12} style={{ marginLeft: '35%' }}>
            <Box display="flex" className={styles.healthCard}>
              <Card display="flex" ref={healthCardRef} className={styles.card}>
                <CardContent className={styles.cardContent}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    className={styles.flexCol}
                  >
                    <Typography className={styles.nameLabel}>
                      {t('healthcarddisplay.NAME')}
                    </Typography>
                    <Typography className={styles.name}>
                      {patientData.name}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    className={styles.flexCol}
                  >
                    <Typography className={styles.dateOfBirthLabel}>
                      {t('healthcarddisplay.DATE OF BIRTH')}
                    </Typography>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      className={styles.flexRow}
                    >
                      <Typography
                        className={styles.dateOfBirth}
                        hidden={!showDateOfBirth}
                        id="dateOfBirth"
                      >
                        {patientData.dateOfBirth}
                      </Typography>
                      <Typography
                        className={styles.dateOfBirth}
                        hidden={showDateOfBirth}
                      >
                        {'**/**/****'}
                      </Typography>
                      <IconButton
                        className={styles.eyeOutline}
                        aria-label="toggle datofbirth visibility"
                        onClick={toggleShowDateOfBirth}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider className={styles.line} variant="middle" />
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    className={styles.flexCol2}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      className={styles.group12}
                    >
                      <Typography className={styles.covid19Vaccination}>
                        {t('healthcarddisplay.VACCINATION RECORD')}
                      </Typography>
                    </Box>
                    <List>
                      {patientData.immunizations.map((item) => (
                        <div key={item.fullUrl}>
                          <ListItem>
                            <HealthCardVaccination
                              immunization={item.resource}
                            />
                          </ListItem>
                        </div>
                      ))}
                    </List>
                  </Box>
                  <Grid
                    item
                    maxWidth="xs"
                    xs={10.5}
                    justifyContent="left"
                    alignItems="flex-end"
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="left"
                      flexDirection="row"
                    >
                      {issuerVerified ? (
                        <Typography className={styles.covid19Vaccination}>
                          {issuerDisplayName}
                        </Typography>
                      ) : (
                        <>
                          <img
                            src={xIcon}
                            alt="Bottom Banner Issuer Icon"
                            style={{
                              height: '1.5rem',
                              marginRight: '1rem',
                            }}
                          />
                          <Typography
                            variant="h6"
                            className={styles.unverifiedText}
                          >
                            {t('healthcarddisplay.Issuer not recognized')}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={12} style={{ marginLeft: '35%' }}>
            <Box mt={5}>
              <Button
                type="button"
                size="large"
                variant="contained"
                color="secondary"
                onClick={handleScan}
                style={{
                  fontSize: '150%',
                  width: healthCardRef.current
                    ? healthCardRef.current.offsetWidth
                    : '35%',
                }}
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
