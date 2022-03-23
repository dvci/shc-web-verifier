import React from 'react';
import { Button, Box } from '@mui/material';
import scanIcon from 'assets/scan-icon.png';
import { useTranslation } from 'react-i18next';

const QrScanButton = ({ onClick, styles }) => {
  const { t } = useTranslation();

  return (
    <Box item xs={12} style={styles}>
      <Button
        type="button"
        size="large"
        variant="contained"
        color="secondary"
        onClick={onClick}
        style={{ fontSize: '150%', width: '100%' }}
      >
        <img
          src={scanIcon}
          alt="Scan Icon"
          style={{ height: '2.5rem', marginRight: '10px' }}
        />
        {t('healthcarddisplay.SCAN QR CODE')}
      </Button>
    </Box>
  );
};

export default QrScanButton;
