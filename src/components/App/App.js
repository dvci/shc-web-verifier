import './App.css';

import React, { useState, useEffect } from 'react';
import { Base64 } from 'js-base64';
import pako from 'pako';
import { CssBaseline } from '@material-ui/core';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HealthCardDisplay from 'components/HealthCardDisplay';
import HealthCardVerify from 'components/HealthCardVerify';
import IssuerVerify, { IssuerDirectories } from 'components/IssuerVerify';
import ThemeProvider from 'components/ThemeProvider';
import Header from 'components/Header';
import HeroBar from 'components/HeroBar';
import Landing from 'components/Landing';
import QrScan from 'components/QrScan';

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

      <Router>
        <HeroBar />

        <Switch>
          <Route exact path="/shc-web-verifier">
            <Landing />
          </Route>

          <Route exact path="/qr-scan">
            <QrScan />
          </Route>

          <Route exact path="/display-results">
            {qrCode && (
              <>
                <HealthCardDisplay patientData={patientData()} />
                <HealthCardVerify jws={getJws(qrCode)} iss={getIssuer()} />
                <IssuerVerify
                  iss={getIssuer()}
                  issuerDirectories={issuerDirectories}
                />
              </>
            )}
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
