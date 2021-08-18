import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, CardHeader, Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  }
});

const HealthCardDisplay = ({ patientData }) => {
  const classes = useStyles();

  const immunizationCode = codings => {
    if (codings.length === 0) return '';

    const coding = codings[0];
    return coding.system ? `${coding.system}#${coding.code}` : coding.code;
  };

  return (
    <div>
      <Typography gutterBottom>
        <span className={classes.bold}>Name: </span><span>{patientData.name}</span>
      </Typography>
      <Typography gutterBottom>
        <span className={classes.bold}>Date of Birth: </span><span>{patientData.dateOfBirth}</span>
      </Typography>
      <Typography variant="h4"> Immunizations </Typography>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        {patientData.immunizations.map((immunization, i) =>
          (
            <Grid item key={i}>
              <Card variant="outlined">
                <CardHeader
                  title={immunization.vaccineCode ? immunizationCode(immunization.vaccineCode.coding) : ''}
                  classes={{ title: classes.bold }}
                />
                <CardContent>
                  <Typography gutterBottom>
                    <span className={classes.bold}>Date: </span><span>{immunization.occurrenceDateTime}</span>
                  </Typography>
                  <Typography gutterBottom>
                    <span className={classes.bold}>Lot: </span><span>{immunization.lotNumber}</span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </div>
  );
};

export default HealthCardDisplay;
