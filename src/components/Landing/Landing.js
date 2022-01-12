import React from 'react';
import {
  Box, Button, Link, Typography
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import checkIcon from 'assets/check-icon.png';
import qrIllustration from 'assets/qr-code-illustration.png';
import qrIcon from 'assets/qr-vaccine-icon.png';
import scanIcon from 'assets/scan-icon.png';
import { useTranslation, Trans } from 'react-i18next';

const Landing = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const handleScan = () => {
    history.push('qr-scan');
  };

  return (
    <Box display="flex" flexDirection="row" justifyContent="center">
      <Box
        mt={2}
        ml={6}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <img
          src={qrIllustration}
          alt="Scan QR Code"
          style={{ width: '650px', height: '600px' }}
        />
      </Box>
      <Box mt={11} mr={4} width="750px">
        <Box>
          <Box display="flex" flexDirection="row">
            <img
              src={qrIcon}
              alt="QR Vaccine Icon"
              style={{ height: '5rem' }}
            />
            <Typography
              variant="h6"
              style={{ marginTop: '5px', marginLeft: '25px' }}
            >
              <Trans
                i18nKey="landing.Verify a SMART Health Card QR code in a safe and privacy-preserving way."
                components={[
                  <Link
                    href="https://smarthealth.cards/"
                    color="secondary"
                    target="_blank"
                    rel="noopener"
                  />
                ]}
              />
            </Typography>
          </Box>
          <Box mt={10} mb={10}>
            <Button
              type="button"
              fullWidth
              size="large"
              variant="contained"
              color="secondary"
              onClick={handleScan}
              style={{ fontSize: '150%' }}
            >
              <img
                src={scanIcon}
                alt="Scan Icon"
                style={{ height: '2.5rem', marginRight: '10px' }}
              />
              {t('landing.SCAN QR CODE')}
            </Button>
          </Box>
          <Box>
            <Typography variant="h6">{t('landing.What is a SMART Health Card?')}</Typography>
            <Typography>
              <img
                src={checkIcon}
                alt="Check Icon"
                style={{ height: '1rem', marginRight: '10px' }}
              />
              {t('landing.Holds important vaccination or lab report data.')}
            </Typography>
            <Typography>
              <img
                src={checkIcon}
                alt="Check Icon"
                style={{ height: '1rem', marginRight: '10px' }}
              />
              {t('landing.Can be scanned to verify that the information has not been tampered with.')}
            </Typography>
          </Box>
          <Box mt={5}>
            <Typography>
              <Trans
                i18nKey="landing.For more information on SMART Health Cards, please visit"
                values={{ url: 'https://smarthealth.cards/' }}
                components={[
                  <Link
                    href="https://smarthealth.cards/"
                    color="secondary"
                    target="_blank"
                    rel="noopener"
                  >
                    https://smarthealth.cards/
                  </Link>
                ]}
              />
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
