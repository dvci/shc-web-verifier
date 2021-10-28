import './App.css';

import React from 'react';
import { CssBaseline } from '@mui/material';
import {
  BrowserRouter as Router, Redirect, Route, Switch
} from 'react-router-dom';
import HealthCardDisplay from 'components/HealthCardDisplay';
import HealthCardVerify from 'components/HealthCardVerify';
import IssuerVerify from 'components/IssuerVerify';
import ThemeProvider from 'components/ThemeProvider';
import Header from 'components/Header';
import HeroBar from 'components/HeroBar';
import Landing from 'components/Landing';
import QrScan from 'components/QrScan';
import { QrDataProvider } from 'components/QrDataProvider';

const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <Header />

    <Router>
      <HeroBar />

      <Switch>
        <Redirect exact from="/" to="/shc-web-verifier" />
        <Route exact path="/shc-web-verifier">
          <Landing />
        </Route>

        <QrDataProvider>
          <Route exact path="/qr-scan">
            <QrScan />
          </Route>

          <Route exact path="/display-results">
            <>
              <HealthCardDisplay />
              <HealthCardVerify />
              <IssuerVerify />
            </>
          </Route>
        </QrDataProvider>
      </Switch>
    </Router>
  </ThemeProvider>
);

export default App;
