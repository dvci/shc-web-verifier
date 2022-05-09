import React from 'react';
import {
  Box, Accordion, AccordionSummary, AccordionDetails, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  faq: {
    color: theme.palette.primary.main,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  box: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '8px',
  },
}));

const FAQ = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.faq}>
      <Box className={classes.box} sx={{ maxWidth: '750px' }}>
        <Typography variant="h6">{t('faq.Frequently asked questions')}</Typography>
        {t('faq.items', { returnObjects: true }).map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Accordion key={i}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: item.answer,
                }}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default FAQ;
