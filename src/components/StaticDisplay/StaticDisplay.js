import React from 'react';
import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  staticDisplay: {
    color: theme.palette.primary.main,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  box: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '8px'
  }
}));

const StaticDisplay = ({ section }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.staticDisplay}>
      <Box className={classes.box} sx={{ maxWidth: '750px' }}>
        <Typography variant="h6">{t(`${section}.title`)}</Typography>
        {t(`${section}.items`, { returnObjects: true, interpolation: { escapeValue: false } }).map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>
            <Typography variant="subtitle1" gutterBottom component="div">
              {item.header}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              dangerouslySetInnerHTML={{
                __html: item.content
              }}
            />
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default StaticDisplay;
