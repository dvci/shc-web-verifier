import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Divider, IconButton, List, ListItem
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useHealthCardDataContext } from 'components/HealthCardDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation } from 'react-i18next';
import xIcon from 'assets/x-icon.png';
import useStyles from './styles';
import { getLabTestCodeDisplay, getLabTestResultCodeDisplay } from './labValueSets';

const LabCard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { jws, issuerVerified, issuerDisplayName } = useHealthCardDataContext();
  const [patientData, setPatientData] = useState({
    name: '',
    labResults: [],
  });
  const [showDateOfBirth, setShowDateOfBirth] = useState(false);

  useEffect(() => {
    if (jws) {
      setPatientData(getPatientData(jws));
    }
  }, [jws]);

  const toggleShowDateOfBirth = () => {
    setShowDateOfBirth(!showDateOfBirth);
  };

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
    <Box className={[styles.flexCol, styles.labRoot].join(' ')}>
      <Box className={styles.divider}>
        <Divider className={styles.line2} />
      </Box>
      <Grid container className={styles.grid}>
        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
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
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>{t('healthcarddisplay.Date')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography className={styles.date}>
              {displayDateTime(labResult.effectiveDateTime)}
            </Typography>
          </Grid>
        </Grid>

        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>{t('healthcarddisplay.Test Result')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            <Typography>
              {displayLabTestResult(labResult)}
            </Typography>
          </Grid>
        </Grid>

        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>{t('healthcarddisplay.Reference Range')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            {labResult.referenceRange && labResult.referenceRange.length > 0 && (
              <Typography>{displayReferenceRange(labResult.referenceRange[0])}</Typography>
            )}
          </Grid>
        </Grid>

        <Grid container item className={styles.gridRow} spacing={0}>
          <Grid item xs={3} sm={2} className={styles.gridLabel}>
            <Typography>{t('healthcarddisplay.Lab Performer')}</Typography>
          </Grid>
          <Grid item xs={9} sm={10} className={styles.gridItem}>
            {labResult.performer && labResult.performer.length > 0 && (
              <Typography>{labResult.performer[0].display}</Typography>
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
            <Typography className={styles.dateOfBirthLabel}>{t('healthcarddisplay.DATE OF BIRTH')}</Typography>
            <Box className={styles.dateOfBirthRow}>
              <Typography className={styles.dateOfBirth} hidden={!showDateOfBirth} id="dateOfBirth">
                {patientData.dateOfBirth}
              </Typography>
              <Typography className={styles.dateOfBirth} hidden={showDateOfBirth}>
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
          <Box className={[styles.flexCol, styles.labRecordBox].join(' ')}>
            <Box className={styles.labRecordLabel}>
              <Typography className={styles.labRecordLabelText}>
                {t('healthcarddisplay.LAB RESULT RECORD')}
              </Typography>
            </Box>
            <List className={styles.labRecordList}>
              {patientData.labResults.map((item) => (
                <div key={item.fullUrl}>
                  <ListItem className={styles.labRecordListItem}>
                    <HealthCardLabResult labResult={item.resource} />
                  </ListItem>
                </div>
              ))}
            </List>
          </Box>
          <Grid item maxWidth="xs" xs={10.5} justifyContent="left" alignItems="flex-end">
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
              {issuerVerified ? (
                <Typography className={styles.covid19lab}>{issuerDisplayName}</Typography>
              ) : (
                <>
                  <img
                    src={xIcon}
                    alt="Bottom Banner Issuer Icon"
                    style={{
                      height: '1.5rem',
                      marginRight: '1rem'
                    }}
                  />
                  <Typography variant="h6" className={styles.unverifiedText}>
                    {t('healthcarddisplay.Issuer not recognized')}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LabCard;
