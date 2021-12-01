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
import axios from 'axios';
import { useQrDataContext } from 'components/QrDataProvider';
import { getPatientData } from 'utils/qrHelpers';
import useStyles from './styles';
import tradenamesXml from './iisstandards_tradename.xml';
import cvxXml from './iisstandards_cvx.xml';

const HealthCardDisplay = () => {
  const styles = useStyles();
  const { qrCodes } = useQrDataContext();
  const patientData = getPatientData(qrCodes);
  const [tradenames, setTradenames] = useState({});
  const [cvxCodes, setCvxCodes] = useState({});
  const [showDateOfBirth, setShowDateOfBirth] = useState(false);

  async function fetchCdcXml(file) {
    const response = await axios.get(file, {
      Accept: 'application/xml'
    });
    let data = await response.data;
    data = data.replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'application/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Error parsing XML');
    }
    return xmlDoc;
  }

  React.useEffect(() => {
    async function fetchTradenames() {
      const xmlDoc = await fetchCdcXml(tradenamesXml);
      const prodInfos = xmlDoc.evaluate('//productnames/prodInfo',
        xmlDoc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      let prodInfo = prodInfos.iterateNext();
      const tn = {};
      while (prodInfo) {
        if (tn[prodInfo.children[5].textContent.trim()]) {
          tn[prodInfo.children[5].textContent.trim()] = prodInfo.children[3].textContent
        } else {
          tn[prodInfo.children[5].textContent.trim()] = prodInfo.children[1].textContent
        }
        prodInfo = prodInfos.iterateNext();
      }
      setTradenames(tn);
    }

    async function fetchCvx() {
      const xmlDoc = await fetchCdcXml(cvxXml);
      const prodInfos = xmlDoc.evaluate('//CVXCodes/CVXInfo',
        xmlDoc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      let prodInfo = prodInfos.iterateNext();
      const cvx = {};
      while (prodInfo) {
        cvx[prodInfo.getElementsByTagName('CVXCode')[0].textContent.trim()] = prodInfo.getElementsByTagName('ShortDescription')[0].textContent
        prodInfo = prodInfos.iterateNext();
      }
      setCvxCodes(cvx);
    }

    fetchTradenames();
    fetchCvx();
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
    <Box display="flex" flexDirection="column" alignItems="flex-start" className={styles.group8}>
      <Box display="flex" alignItems="center" justifyContent="center" alignSelf="flex-end" className={styles.group7}>
        <Divider className={styles.line2} variant="middle" />
      </Box>
      <Grid container columnSpacing={{ xs: 1, sm: 1, md: 3 }}>
        <Grid item xs={3} className={styles.gridLabel}>
          <Typography>Vaccine</Typography>
        </Grid>
        <Grid item xs={9} className={styles.gridItem}>
          <Typography>
            <Box component="span" fontWeight="700">
              {immunization.vaccineCode ? immunizationDisplayName(immunization.vaccineCode.coding) : ''}
            </Box>
            {immunization.lotNumber && (` Lot #${immunization.lotNumber}`)}
          </Typography>
        </Grid>
        <Grid item xs={3} className={styles.gridLabel}>
          <Typography>Date</Typography>
        </Grid>
        <Grid item xs={8} className={styles.gridItem}>
          <Typography className={styles.date}>{immunization.occurrenceDateTime}</Typography>
        </Grid>
        <Grid item xs={3} className={styles.gridLabel}>
          <Typography>
            Vaccinator
          </Typography>
        </Grid>
        <Grid item xs={9} className={styles.gridItem}>
          {(immunization.performer && immunization.performer.length > 0) && (
            <Typography>
              {immunization.performer[0].actor.display}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box display="flex" className={styles.healthCard}>
      <Card display="flex" className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            className={styles.flexCol}
          >
            <Typography className={styles.nameLabel}>NAME</Typography>
            <Typography className={styles.name}>
              {patientData.name}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-start" className={styles.flexCol}>
            <Typography className={styles.dateOfBirthLabel}>
              DATE OF BIRTH
            </Typography>
            <Box display="flex" flexDirection="row" alignItems="center" className={styles.flexRow}>
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
          <Divider className={styles.line} variant="middle" />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            className={styles.flexCol2}
          >
            <Box display="flex" alignItems="center" justifyContent="center" className={styles.group12}>
              <Typography className={styles.covid19Vaccination}>
                VACCINATION RECORD
              </Typography>
            </Box>
            <List>
              {patientData.immunizations.map((item) => (
                <div key={item.fullUrl}>
                  <ListItem>
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

export default HealthCardDisplay;
