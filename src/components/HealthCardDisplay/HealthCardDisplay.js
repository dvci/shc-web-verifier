import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Card, CardContent, CardHeader, Grid, Typography 
} from '@material-ui/core';
import tradenames_xml from './iisstandards_tradename.xml';
import axios from 'axios';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const HealthCardDisplay = ({ patientData }) => {
  const classes = useStyles();

  const [tradenames, setTradenames] = useState({});

  useEffect(() => {
    async function fetchTradenames() {
      const response = await axios.get(tradenames_xml, {
        "Accept": "application/xml"
      });
      var data = await response.data;
      data = data.replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "application/xml");
      if(xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Error parsing XML');
    }
      const prodInfos = xmlDoc.evaluate("//productnames/prodInfo", 
        xmlDoc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      var prodInfo = null;
      var tn = {};
      while ((prodInfo = prodInfos.iterateNext())) {
        if(tn[prodInfo.children[5].textContent.trim()]){
          tn[prodInfo.children[5].textContent.trim()] = prodInfo.children[3].textContent
        }else{
          tn[prodInfo.children[5].textContent.trim()] = prodInfo.children[1].textContent
        }        
      }
      setTradenames(tn);
    }

    fetchTradenames();
  }, []);

  const immunizationDisplayName = (codings) => {
    if (codings.length === 0) return '';

    const coding = codings[0];

    if(!tradenames[coding.code]){
      return coding.system ? `${coding.system}#${coding.code}` : coding.code;
    }else{
      return tradenames[coding.code];
    }
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
