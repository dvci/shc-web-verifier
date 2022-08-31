import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Divider, List, ListItem
} from '@mui/material';
import { useHealthCardDataContext } from 'components/HealthCardDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from 'react-error-boundary';
import useStyles from '../HealthCard/styles';
import { fetchTradenames, fetchCvx } from './iisstandards';

const VaccineCard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { jws } = useHealthCardDataContext();
  const [patientData, setPatientData] = useState({
    name: '',
    immunizations: []
  });
  const [tradenames, setTradenames] = useState({});
  const [cvxCodes, setCvxCodes] = useState({});
  const handleError = useErrorHandler();

  useEffect(() => {
    if (jws) {
      setPatientData(getPatientData(jws));
    }
  }, [jws]);

  useEffect(() => {
    async function getTradenames() {
      try {
        const tn = await fetchTradenames();
        setTradenames(tn);
      } catch (e) {
        handleError(e);
      }
    }

    async function getCvx() {
      try {
        const cvx = await fetchCvx();
        setCvxCodes(cvx);
      } catch (e) {
        handleError(e);
      }
    }

    getTradenames();
    getCvx();
  }, [handleError]);

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

  const orderImmunizations = (immunizationsArray) => {
    // sort immunizations in ascending order based on occurrence date
    const sortedAsc = immunizationsArray.sort(
      (imm1, imm2) => new Date(imm1.resource.occurrenceDateTime)
       - new Date(imm2.resource.occurrenceDateTime),
    );
    return sortedAsc;
  };

  const HealthCardVaccination = ({ immunization }) => (
    <Box className={[styles.flexCol, styles.vaccinationRoot].join(' ')}>
      <Box className={styles.divider}>
        <Divider className={styles.line2} />
      </Box>
      <Grid container className={styles.grid}>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.vaccinationGridLabel}>
            <Typography>{t('healthcarddisplay.Vaccine')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography>
              <Box component="span" fontWeight="700">
                {immunization.vaccineCode
                  ? immunizationDisplayName(immunization.vaccineCode.coding)
                  : ''}
              </Box>
              {immunization.lotNumber && ` ${t('healthcarddisplay.Lot')} #${immunization.lotNumber}`}
            </Typography>
          </Grid>
        </Grid>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.vaccinationGridLabel}>
            <Typography>{t('healthcarddisplay.Date')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography className={styles.date}>
              {immunization.occurrenceDateTime}
            </Typography>
          </Grid>
        </Grid>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.vaccinationGridLabel}>
            <Typography>{t('healthcarddisplay.Vaccinator')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            {immunization.performer && immunization.performer.length > 0 && (
              <Typography>{immunization.performer[0].actor.display}</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box className={[styles.flexCol, styles.vaccinationRecordBox].join(' ')}>
      <Box className={styles.vaccinationRecordLabel}>
        <Typography className={styles.vaccinationRecordLabelText}>
          {t('healthcarddisplay.VACCINATION RECORD')}
        </Typography>
      </Box>
      <List className={styles.vaccinationRecordList}>
        {orderImmunizations(patientData.immunizations).map((item) => (
          <div key={item.fullUrl}>
            <ListItem className={styles.vaccinationRecordListItem}>
              <HealthCardVaccination immunization={item.resource} />
            </ListItem>
          </div>
        ))}
      </List>
    </Box>
  );
};

export default VaccineCard;
