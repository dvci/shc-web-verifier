import './App.css';

import React, { useState } from 'react';
import { Base64 } from 'js-base64';
import jsQR from 'jsqr';
import pako from 'pako';
import HealthCardDisplay from 'components/HealthCardDisplay';
import HealthCardVerify from 'components/HealthCardVerify';
import IssuerVerify from 'components/IssuerVerify';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrCode, setQrCode] = useState(null);

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

  const stopScanning = () => {
    const video = document.getElementById('video');
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.remove();
    document.getElementById('canvas').hidden = true;
    document.getElementById('loadingMessage').hidden = true;
    setIsScanning(false);
  };

  function tick() {
    const video = document.getElementById('video');
    if (!video) {
      return;
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvasElement = document.getElementById('canvas');
      const canvas = canvasElement.getContext('2d');
      const loadingMessage = document.getElementById('loadingMessage');
      const statusMessage = document.getElementById('statusMessage');

      loadingMessage.hidden = true;
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
          stopScanning();
          setQrCode(code.data);
        } else {
          statusMessage.innerText = 'QR code does not contain a SMART Health Card';
        }
      } else {
        statusMessage.innerText = 'No QR code detected';
      }
    }

    requestAnimationFrame(tick);
  }

  const startScanning = () => {
    setIsScanning(true);
    setQrCode(null);

    const video = document.createElement('video');
    const loadingMessage = document.getElementById('loadingMessage');
    video.id = 'video';
    video.hidden = true;
    document.children[0].appendChild(video);
    loadingMessage.hidden = false;

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

  const startButton = (
    <button type="button" id="start" onClick={startScanning} disabled={isScanning}>
      Scan
    </button>
  );

  const stopButton = (
    <button type="button" id="stop" onClick={stopScanning} disabled={!isScanning}>
      Stop
    </button>
  );

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
    <div className="App">
      <header className="App-header">
        <h1>SMART Health Cards Web Verifier</h1>
      </header>
      <div>
        {startButton}
        {stopButton}
      </div>
      <div id="loadingMessage" hidden>
        Loading...
      </div>
      <canvas id="canvas" hidden={!isScanning} />
      <div id="statusMessage" hidden={!isScanning}>
        No QR code detected.
      </div>
      {qrCode && !isScanning ? <HealthCardDisplay patientData={patientData()} /> : ''}
      {qrCode && !isScanning ? <HealthCardVerify jws={getJws(qrCode)} iss={getIssuer()} /> : ''}
      {qrCode && !isScanning ? <IssuerVerify iss={getIssuer()} /> : ''}
    </div>
  );
}

export default App;
