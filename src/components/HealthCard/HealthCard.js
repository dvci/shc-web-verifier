import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Divider, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useHealthCardDataContext } from 'components/HealthCardDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import { useTranslation } from 'react-i18next';
import xIcon from 'assets/x-icon.png';
import useStyles from './styles';

const HealthCard = ({ children }) => {
  const HealthCardContents = children;
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

  return (
    <Box display="flex" className={styles.healthCard}>
      <Card display="flex" className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Box className={[styles.flexCol, styles.patientData].join(' ')}>
            <Typography className={styles.nameLabel}>
              {t('healthcarddisplay.NAME')}
            </Typography>
            <Typography className={styles.name}>{patientData.name}</Typography>
          </Box>
          <Box className={[styles.flexCol, styles.patientData].join(' ')}>
            <Typography className={styles.dateOfBirthLabel}>{t('healthcarddisplay.DATE OF BIRTH')}</Typography>
            <Box className={styles.dateOfBirthRow}>
              <Typography className={styles.dateOfBirth} hidden={!showDateOfBirth} id="dateOfBirth">
                {patientData.dateOfBirth}
              </Typography>
              <Typography className={styles.dateOfBirth} hidden={showDateOfBirth}>
                xxxx-xx-xx
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
          <HealthCardContents />
          <Grid item maxWidth="xs" xs={10.5} justifyContent="left" alignItems="flex-end">
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
              {issuerVerified ? (
                <Typography className={styles.covid19Vaccination}>{issuerDisplayName}</Typography>
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

export default HealthCard;
