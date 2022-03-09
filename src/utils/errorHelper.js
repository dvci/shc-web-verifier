/* eslint-disable no-console */
import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box, Typography, Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const resetErrorHandler = () => {
  localStorage.clear();
}

const ErrorFallback = ({ resetErrorBoundary }) => {
  const history = useHistory();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%" flexDirection="column" alignItems="center" marginTop="2em">
      <Box sx={{ maxWidth: '750px' }}>
        <Typography variant="h6">{t('error.An unexpected error occured.')}</Typography>
        <Button
          type="button"
          onClick={() => {
            resetErrorHandler();
            resetErrorBoundary();
            history.push('/');
          }}
        >
          {t('error.Return to main page.')}
        </Button>
      </Box>
    </Box>
  );
};

export {
  ErrorFallback,
  resetErrorHandler,
};
