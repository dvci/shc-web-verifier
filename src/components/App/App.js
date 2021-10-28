import './App.css';

import React, { useState, useEffect } from 'react';
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
import { QrDataProvider } from 'components/QrDataProvider';

const App = () => {
  const [issuerDirectories, setIssuerDirectories] = useState(null);

  useEffect(() => {
    IssuerDirectories.getIssuerDirectories()
      .then((fetchedDirectories) => {
        setIssuerDirectories(fetchedDirectories);
      }).catch(() => {
        setIssuerDirectories(null);
      });
  }, []);

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

          <QrDataProvider>
            <Route exact path="/qr-scan">
              <QrScan />
            </Route>

            <Route exact path="/display-results">
              {/* {qrCode && (
                <>
                  <HealthCardDisplay patientData={patientData()} />
                  <HealthCardVerify jws={getJws(qrCode)} iss={getIssuer()} />
                  <IssuerVerify
                    iss={getIssuer()}
                    issuerDirectories={issuerDirectories}
                  />
                </>
              )} */}
            </Route>
          </QrDataProvider>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
