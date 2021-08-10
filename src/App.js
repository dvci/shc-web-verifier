import './App.css';

import React, { useState } from 'react';
import { Base64 } from 'js-base64';
import jsQR from 'jsqr';
import pako from 'pako';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState(null);

  function tick() {
    const video = document.getElementById("video");
    if(!video) {
      return;
    }

    if(video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvasElement = document.getElementById("canvas");
      const canvas = canvasElement.getContext("2d");
      const loadingMessage = document.getElementById("loadingMessage");
      const statusMessage = document.getElementById("statusMessage");

      loadingMessage.hidden = true;
      canvasElement.hidden = false;

      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if(code) {
        console.log(`QR code contents: ${code.data}`);
        if(code.data.startsWith('shc:/')) {
          stopScanning();
          const decodedQr = decodeQr(code.data);
          const patientData = extractPatientData(decodedQr);
          setQrData(patientData);
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
    const video = document.createElement("video");
    const loadingMessage = document.getElementById("loadingMessage");
    video.id = 'video';
    video.hidden = true;
    document.children[0].appendChild(video);
    loadingMessage.hidden = false;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();
      requestAnimationFrame(tick);
    });
  };

  const stopScanning = () => {
    const video = document.getElementById("video");
    video.srcObject.getTracks().forEach(track => track.stop());
    video.remove();
    document.getElementById('canvas').hidden = true;
    setIsScanning(false);
  };

  const startButton = (
    <button id="start" onClick={startScanning} disabled={isScanning}>Scan</button>
  );

  const stopButton = (
    <button id="stop" onClick={stopScanning} disabled={!isScanning}>Stop</button>
  );

  const healthCardDisplay = () => (
    <div>
      <div>
        <span>{qrData.name}</span>
      </div>
      <div>
        <span>{qrData.dateOfBirth}</span>
      </div>
      {immunizationsDisplay()}
    </div>
  );

  const immunizationsDisplay = () => {
    return qrData.immunizations.map((immunization, i) => {
      return (
        <div key={i}>
          <span>{immunization.occurrenceDateTime}: </span>
          {immunization.vaccineCode ? immunizationCodeDisplay(immunization.vaccineCode.coding) : ''}
        </div>
      );
    });
  };

  const immunizationCodeDisplay = codings => {
    return codings.map((coding, i) => {
      return (
        <span key={i}>{coding.system ? `${coding.system}#${coding.code}` : coding.code}</span>
      );
    });
  };

  const decodeQr = qrString => {
    const sliceIndex = qrString.lastIndexOf('/');
    const rawPayload = qrString.slice(sliceIndex + 1);
    const encodingChars = rawPayload.match(/\d\d/g);
    const jwsString = encodingChars.map(charPair => String.fromCharCode(+charPair +45)).join('');
    const dataString = jwsString.split('.')[1];
    const decodedPayload = Base64.toUint8Array(dataString);
    const inflatedPayload = pako.inflateRaw(decodedPayload);
    const payload = new TextDecoder().decode(inflatedPayload);
    return payload;
  };

  const extractPatientData = card => {
    const bundle = JSON.parse(card).vc.credentialSubject.fhirBundle;
    const patient = bundle.entry.find(entry => entry.resource.resourceType === 'Patient').resource;

    const name = extractPatientName(patient);
    const dateOfBirth = patient.birthDate;
    const immunizations = extractImmunizations(bundle);
    return { name, dateOfBirth, immunizations };
  };

  const extractPatientName = patient => {
    const nameElement = patient.name[0];

    if(nameElement.text) {
      return nameElement.text;
    }

    const prefix = nameElement.prefix ? nameElement.prefix.join(' ') : '';
    const given = nameElement.given ? nameElement.given.join(' ') : '';
    const family = nameElement.family ? nameElement.family : '';
    const suffix = nameElement.suffix ? nameElement.suffix.join(' ') : '';

    const name = [prefix, given, family, suffix].join(' ');
    return name;
  };

  const extractImmunizations = bundle => {
    const immunizationResources =
      bundle
        .entry
        .filter(entry => entry.resource.resourceType === 'Immunization')
        .map(entry => entry.resource);

    return immunizationResources;
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
      <div id="loadingMessage" hidden>Loading...</div>
      <canvas id="canvas" hidden={!isScanning}></canvas>
      <div id="statusMessage" hidden={!isScanning}>No QR code detected.</div>
      { qrData && !isScanning ? healthCardDisplay() : '' }
    </div>
  );
}

export default App;
