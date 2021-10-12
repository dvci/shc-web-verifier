import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card, CardContent, CardHeader, Grid, Typography
} from '@material-ui/core';
import axios from 'axios';
import tradenamesXml from './iisstandards_tradename.xml';
import cvxXml from './iisstandards_cvx.xml';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const HealthCardDisplay = ({ patientData }) => {
  const classes = useStyles();

  const [tradenames, setTradenames] = useState({});
  const [cvxCodes, setCvxCodes] = useState({});

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

  const immunizationDisplay = (immunization) => {
    const { fullUrl, resource } = immunization;

    return (
      <Grid item key={fullUrl}>
        <Card variant="outlined">
          <CardHeader
            title={
              resource.vaccineCode ? immunizationDisplayName(resource.vaccineCode.coding) : ''
            }
            classes={{ title: classes.bold }}
          />
          <CardContent>
            <Typography gutterBottom>
              <span className={classes.bold}>Date: </span>
              <span>{resource.occurrenceDateTime}</span>
            </Typography>
            {resource.lotNumber && (
              <Typography gutterBottom>
                <span className={classes.bold}>Lot: </span>
                <span>{resource.lotNumber}</span>
              </Typography>
            )}
            {(resource.performer && resource.performer.length > 0) && (
              <Typography gutterBottom>
                <span className={classes.bold}>Performer: </span>
                <span>{resource.performer[0].actor.display}</span>
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <div>
      <Typography gutterBottom>
        <span className={classes.bold}>Name: </span>
        <span>{patientData.name}</span>
      </Typography>
      <Typography gutterBottom>
        <span className={classes.bold}>Date of Birth: </span>
        <span>{patientData.dateOfBirth}</span>
      </Typography>
      <Typography variant="h4"> Immunizations </Typography>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        {patientData.immunizations.map((i) => immunizationDisplay(i))}
      </Grid>
    </div>
  );
};

export default HealthCardDisplay;
