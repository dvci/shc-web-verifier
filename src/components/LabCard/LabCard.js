import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Divider, List, ListItem
} from '@mui/material';
import { useHealthCardDataContext } from 'components/HealthCardDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation } from 'react-i18next';
import useStyles from '../HealthCard/styles';
import { getLabTestCodeDisplay, getLabTestResultCodeDisplay } from './labValueSets';

const LabCard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { jws } = useHealthCardDataContext();
  const [patientData, setPatientData] = useState({
    name: '',
    labResults: [],
  });

  useEffect(() => {
    if (jws) {
      setPatientData(getPatientData(jws));
    }
  }, [jws]);

  const displayLabTestCode = (code) => {
    if (code?.coding && code?.coding.length >= 0) {
      const coding = code.coding[0]
      if (coding.system && coding.code) {
        return getLabTestCodeDisplay(coding.system, coding.code) || `${coding.system}#${coding.code}`;
      }
      return coding.code || '';
    }
    return '';
  }

  const displayLabTestResult = (labResult) => {
    if (labResult.valueCodeableConcept) {
      const coding = labResult.valueCodeableConcept.coding[0];
      if (coding.system && coding.code) {
        return getLabTestResultCodeDisplay(coding.system, coding.code) || `${coding.system}#${coding.code}`;
      }
      return coding.code || '';
    }
    if (labResult.valueQuantity) {
      if (labResult.valueQuantity.value) {
        if (labResult.valueQuantity.unit) return `${labResult.valueQuantity.value} ${labResult.valueQuantity.unit}`;
        return labResult.valueQuantity.code ? `${labResult.valueQuantity.value} ${labResult.valueQuantity.code}` : labResult.valueQuantity.value;
      }
    }
    return labResult.valueString || '';
  }

  const displayDateTime = (dateTimeString) => {
    const [date, time] = dateTimeString.split('T');
    if (!time) return date;
    const d = new Date(dateTimeString);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (`${date} ${d.toLocaleTimeString('en-US')} (${timezone})`);
  }

  const displayReferenceRange = (referenceRange) => {
    if (referenceRange.text) return referenceRange.text;
    const lowVal = referenceRange.low;
    const highVal = referenceRange.high;
    if (lowVal && highVal) return (`${lowVal.value} ${lowVal.unit || ''} - ${highVal.value} ${highVal.unit || ''}`);
    if (lowVal) return (`>= ${lowVal.value} ${lowVal.unit || ''}`);
    if (highVal) return (`<= ${highVal.value} ${highVal.unit || ''}`);
    return '';
  }

  const HealthCardLabResult = ({ labResult }) => (
    <Box className={[styles.flexCol, styles.vaccinationRoot].join(' ')}>
      <Box className={styles.divider}>
        <Divider className={styles.line2} />
      </Box>
      <Grid container className={styles.grid}>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.labGridLabel}>
            <Typography>{t('healthcarddisplay.Lab Test')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography>
              <Box component="span" fontWeight="700">
                {displayLabTestCode(labResult.code)}
              </Box>
            </Typography>
          </Grid>
        </Grid>

        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.labGridLabel}>
            <Typography>{t('healthcarddisplay.Date')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography className={styles.date}>
              {displayDateTime(labResult.effectiveDateTime)}
            </Typography>
          </Grid>
        </Grid>

        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.labGridLabel}>
            <Typography>{t('healthcarddisplay.Lab Performer')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            {labResult.performer && labResult.performer.length > 0 && (
              <Typography>{labResult.performer[0].display}</Typography>
            )}
          </Grid>
        </Grid>

        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.labGridLabel}>
            <Typography>{t('healthcarddisplay.Test Result')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography>
              {displayLabTestResult(labResult)}
            </Typography>
          </Grid>
        </Grid>

        {labResult.referenceRange && labResult.referenceRange.length > 0 && (
          <Grid container item className={styles.gridRow} spacing={0}>
            <Grid item xs={3} sm={2} className={styles.labGridLabel}>
              <Typography>{t('healthcarddisplay.Reference Range')}</Typography>
            </Grid>
            <Grid item xs={9} sm={10} className={styles.gridItem}>
              <Typography>{displayReferenceRange(labResult.referenceRange[0])}</Typography>
            </Grid>
          </Grid>
        )}

      </Grid>
    </Box>
  );

  return (
    <Box className={[styles.flexCol, styles.vaccinationRecordBox].join(' ')}>
      <Box className={styles.vaccinationRecordLabel}>
        <Typography className={styles.vaccinationRecordLabelText}>
          {t('healthcarddisplay.LAB RESULT RECORD')}
        </Typography>
      </Box>
      <List className={styles.vaccinationRecordList}>
        {patientData.labResults.map((item) => (
          <div key={item.fullUrl}>
            <ListItem className={styles.vaccinationRecordListItem}>
              <HealthCardLabResult labResult={item.resource} />
            </ListItem>
          </div>
        ))}
      </List>
    </Box>
  );
};

export default LabCard;
