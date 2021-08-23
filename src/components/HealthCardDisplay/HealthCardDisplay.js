import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card, CardContent, CardHeader, Grid, Typography
} from '@material-ui/core';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const HealthCardDisplay = ({ patientData }) => {
  const classes = useStyles();

  const immunizationCode = (codings) => {
    if (codings.length === 0) return '';

    const coding = codings[0];
    return coding.system ? `${coding.system}#${coding.code}` : coding.code;
  };

  const immunizationDisplay = (immunization) => {
    const { fullUrl, resource } = immunization;

    return (
      <Grid item key={fullUrl}>
        <Card variant="outlined">
          <CardHeader
            title={
              resource.vaccineCode ? immunizationCode(resource.vaccineCode.coding) : ''
            }
            classes={{ title: classes.bold }}
          />
          <CardContent>
            <Typography gutterBottom>
              <span className={classes.bold}>Date: </span>
              <span>{resource.occurrenceDateTime}</span>
            </Typography>
            <Typography gutterBottom>
              <span className={classes.bold}>Lot: </span>
              <span>{resource.lotNumber}</span>
            </Typography>
            <Typography gutterBottom>
              <span className={classes.bold}>Performer: </span>
              <span>{resource.performer[0].actor.display}</span>
            </Typography>
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
