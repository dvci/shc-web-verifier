import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQrDataContext } from 'components/QrDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { fetchTradenames, fetchCvx } from './iisstandards';

const VaccineCard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const {
    qrCodes
  } = useQrDataContext();
  const patientData = getPatientData(qrCodes);
  const [tradenames, setTradenames] = useState({});
  const [cvxCodes, setCvxCodes] = useState({});
  const [showDateOfBirth, setShowDateOfBirth] = useState(false);

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
    <Box className={[styles.flexCol, styles.vaccinationRoot].join(' ')}>
      <Box className={styles.divider}>
        <Divider className={styles.line2} />
      </Box>
      <Grid container className={styles.grid}>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>{t('healthcarddisplay.Vaccine')}</Typography>
          </Grid>
          <Grid item xs className={styles.gridItem}>
            <Typography>
              <Box component="span" fontWeight="700">
                {immunization.vaccineCode ? immunizationDisplayName(immunization.vaccineCode.coding) : ''}
              </Box>
              {immunization.lotNumber && (` ${t('healthcarddisplay.Lot')} #${immunization.lotNumber}`)}
            </Typography>
          </Grid>
        </Grid>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>{t('healthcarddisplay.Date')}</Typography>
          </Grid>
          <Grid item xs className={styles.gridItem}>
            <Typography className={styles.date}>{immunization.occurrenceDateTime}</Typography>
          </Grid>
        </Grid>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>
              {t('healthcarddisplay.Vaccinator')}
            </Typography>
          </Grid>
          <Grid item xs className={styles.gridItem}>
            {(immunization.performer && immunization.performer.length > 0) && (
            <Typography>
              {immunization.performer[0].actor.display}
            </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box display="flex" className={styles.healthCard}>
      <Card display="flex" className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Box className={[styles.flexCol, styles.patientData].join(' ')}>
            <Typography className={styles.nameLabel}>{t('healthcarddisplay.NAME')}</Typography>
            <Typography className={styles.name}>{patientData.name}</Typography>
          </Box>
          <Box className={[styles.flexCol, styles.patientData].join(' ')}>
            <Typography className={styles.dateOfBirthLabel}>
              {t('healthcarddisplay.DATE OF BIRTH')}
            </Typography>
            <Box className={styles.dateOfBirthRow}>
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
          <Divider className={styles.line} />
          <Box className={[styles.flexCol, styles.vaccinationRecordBox].join(' ')}>
            <Box className={styles.vaccinationRecordLabel}>
              <Typography className={styles.vaccinationRecordLabelText}>
                {t('healthcarddisplay.VACCINATION RECORD')}
              </Typography>
            </Box>
            <List className={styles.vaccinationRecordList}>
              {patientData.immunizations.map((item) => (
                <div key={item.fullUrl}>
                  <ListItem className={styles.vaccinationRecordListItem}>
                    <HealthCardVaccination immunization={item.resource} />
                  </ListItem>
                </div>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VaccineCard;
