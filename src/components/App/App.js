import './App.css';

import React, { useState, useEffect } from 'react';
import { Base64 } from 'js-base64';
import jsQR from 'jsqr';
import pako from 'pako';
import {
  Box, Button, CssBaseline, Link, Typography
} from '@material-ui/core';
import HealthCardDisplay from 'components/HealthCardDisplay';
import HealthCardVerify from 'components/HealthCardVerify';
import IssuerVerify, { IssuerDirectories } from 'components/IssuerVerify';
import ThemeProvider from 'components/ThemeProvider';
import Header from 'components/Header';
import HeroBar from 'components/HeroBar';
import qrIllustration from 'assets/qr-code-illustration.png';
import qrIcon from 'assets/qr-vaccine-icon.png';
import checkIcon from 'assets/check-icon.png';
import scanIcon from 'assets/scan-icon.png';
import frame from 'assets/frame.png';

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [issuerDirectories, setIssuerDirectories] = useState(null);

  useEffect(() => {
    IssuerDirectories.getIssuerDirectories()
      .then((fetchedDirectories) => {
        setIssuerDirectories(fetchedDirectories);
      }).catch(() => {
        setIssuerDirectories(null);
      });
  }, []);

  const getJws = (qrString) => {
    const sliceIndex = qrString.lastIndexOf('/');
    const rawPayload = qrString.slice(sliceIndex + 1);
    const encodingChars = rawPayload.match(/\d\d/g);
    return encodingChars.map((charPair) => String.fromCharCode(+charPair + 45)).join('');
  };

  const getPayload = (qrString) => {
    const jwsString = getJws(qrString)
    const dataString = jwsString.split('.')[1];
    const decodedPayload = Base64.toUint8Array(dataString);
    const inflatedPayload = pako.inflateRaw(decodedPayload);
    const payload = new TextDecoder().decode(inflatedPayload);
    return payload;
  };

  const extractPatientName = (patient) => {
    const nameElement = patient.name[0];

    if (nameElement.text) {
      return nameElement.text;
    }

    const prefix = nameElement.prefix ? nameElement.prefix.join(' ') : '';
    const given = nameElement.given ? nameElement.given.join(' ') : '';
    const family = nameElement.family ? nameElement.family : '';
    const suffix = nameElement.suffix ? nameElement.suffix.join(' ') : '';

    const name = [prefix, given, family, suffix].join(' ');

    return name.trim();
  };

  const extractImmunizations = (bundle) => {
    const immunizationResources = bundle.entry
      .filter((entry) => entry.resource.resourceType === 'Immunization')

    return immunizationResources;
  };

  const extractPatientData = (card) => {
    const bundle = JSON.parse(card).vc.credentialSubject.fhirBundle;
    const patient = bundle.entry.find(
      (entry) => entry.resource.resourceType === 'Patient'
    ).resource;

    const name = extractPatientName(patient);
    const dateOfBirth = patient.birthDate;
    const immunizations = extractImmunizations(bundle);
    return { name, dateOfBirth, immunizations };
  };

  const home = () => {
    const video = document.getElementById('video');
    if (video) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.remove();
    }
    document.getElementById('canvas').hidden = true;
    setIsScanning(false);
    setQrCode(false);
  };

  function tick() {
    const video = document.getElementById('video');
    if (!video) {
      return;
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvasElement = document.getElementById('canvas');
      const canvas = canvasElement.getContext('2d');
      canvasElement.hidden = false;

      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      if (code) {
        if (code.data.startsWith('shc:/')) {
          video.srcObject.getTracks().forEach((track) => track.stop());
          video.remove();
          setQrCode(code.data);
          setIsScanning(false);
        }
      }
    }

    requestAnimationFrame(tick);
  }

  const startScanning = () => {
    setIsScanning(true);
    setQrCode(null);

    const video = document.createElement('video');
    video.id = 'video';
    video.hidden = true;
    document.children[0].appendChild(video);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play().catch(() => {
          /* ignore error since it's caused by us stopping the scan */
        });
        requestAnimationFrame(tick);
      });
  };

  const patientData = () => {
    if (!qrCode) { return null; }
    const decodedQr = getPayload(qrCode);
    return extractPatientData(decodedQr);
  };

  const getIssuer = () => {
    if (!qrCode) { return null; }
    const payload = JSON.parse(getPayload(qrCode));
    return payload.iss;
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <Header />
      <HeroBar isScanning={isScanning} qrCode={qrCode} home={home} />

      {!qrCode && !isScanning && (
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
                  Verify a&nbsp;
                  <Link
                    href="https://smarthealth.cards/"
                    color="secondary"
                    target="_blank"
                    rel="noopener"
                  >
                    SMART Health Card
                  </Link>
                  &nbsp;QR code in a safe and privacy-preserving way.
                </Typography>
              </Box>
              <Box mt={10} mb={10}>
                <Button
                  type="button"
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={startScanning}
                >
                  <img
                    src={scanIcon}
                    alt="Scan Icon"
                    style={{ height: '2rem', marginRight: '10px' }}
                  />
                  SCAN QR CODE
                </Button>
              </Box>
              <Box>
                <Typography variant="h6">
                  What is a SMART Health Card?
                </Typography>
                <Typography>
                  <img
                    src={checkIcon}
                    alt="Check Icon"
                    style={{ height: '1rem', marginRight: '10px' }}
                  />
                  Holds important vaccination or lab report data.
                </Typography>
                <Typography>
                  <img
                    src={checkIcon}
                    alt="Check Icon"
                    style={{ height: '1rem', marginRight: '10px' }}
                  />
                  Can be scanned to verify that the information has not been
                  tampered with.
                </Typography>
              </Box>
              <Box mt={5}>
                <Typography>
                  For more information on SMART Health Cards, please visit
                  <br />
                  <Link
                    href="https://smarthealth.cards/"
                    color="secondary"
                    target="_blank"
                    rel="noopener"
                  >
                    https://smarthealth.cards/
                  </Link>
                  .
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Box
        mt={10}
        display="flex"
        justifyContent="center"
        bgcolor="common.grayMedium"
      >
        <canvas
          id="canvas"
          hidden={!isScanning}
          style={{
            position: 'absolute',
            marginTop: '4.5rem',
            height: '500px',
            width: '570px',
            zIndex: '1',
          }}
        />
        <img
          hidden={!isScanning}
          src={frame}
          alt="Scan Frame"
          style={{
            height: '550px',
            width: '640px',
            marginTop: '3rem',
            marginBottom: '3rem',
            zIndex: '2',
          }}
        />
      </Box>
      {qrCode && !isScanning && (
        <>
          <HealthCardDisplay patientData={patientData()} />
          <HealthCardVerify jws={getJws(qrCode)} iss={getIssuer()} />
          <IssuerVerify
            iss={getIssuer()}
            issuerDirectories={issuerDirectories}
          />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
