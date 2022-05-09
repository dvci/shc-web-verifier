import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';
import { Validator } from './Validator.tsx';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const ValidatorDisplay = ({ bundle, action }) => {
  const classes = useStyles();

  const [validPrimarySeries, setValidPrimarySeries] = useState(null);

  useEffect(() => {
    const validationResults = Validator.execute(bundle, action);
    setValidPrimarySeries(validationResults.some((series) => series.validPrimarySeries));
  }, [action, bundle]);

  return (
    <div>
      <Typography>
        <span className={classes.bold}>Primary series valid: </span>
        <span>{String(validPrimarySeries)}</span>
      </Typography>
    </div>
  );
};

export default ValidatorDisplay;
