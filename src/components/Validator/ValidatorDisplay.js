import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid, Typography
} from '@material-ui/core';
import { Validator } from './Validator.tsx';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const ValidatorDisplay = ({ bundle, action }) => {
  const classes = useStyles();

  const [validationResults, setValidationResults] = useState([]);

  useEffect(() => {
    setValidationResults(Validator.execute(
      bundle,
      action
    ));
  }, [action, bundle]);

  const seriesDisplay = (series) => {
    const { seriesName, complete } = series;

    return (
      <div>
        <Typography>
          {`${seriesName}: `}
        </Typography>
        {complete.map((c) => (
          <div>
            {c.map((dose) => (
              <div>
                {`${dose.doseNumber}: `}
                {JSON.stringify(dose.immunization)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Typography>
        <span className={classes.bold}>Validation</span>
      </Typography>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        {validationResults.map((series) => seriesDisplay(series))}
      </Grid>
    </div>
  );
};

export default ValidatorDisplay;
