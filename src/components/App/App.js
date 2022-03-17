import './App.css';

import React from 'react';
import { CssBaseline } from '@mui/material';
import {
  HashRouter as Router, Redirect, Route, Switch
} from 'react-router-dom';
import HealthCardDisplay from 'components/HealthCardDisplay';
import ThemeProvider from 'components/ThemeProvider';
import Header from 'components/Header';
import HeroBar from 'components/HeroBar';
import Landing from 'components/Landing';
import QrScan from 'components/QrScan';
import { QrDataProvider } from 'components/QrDataProvider';
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from 'utils/errorHelper';

const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <Header />
    <Router>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
      >
        <HeroBar hasError={false} />
        <Switch>
          <Redirect exact from="/shc-web-verifier" to="/" />
          <Route exact path="/">
            <Landing />
          </Route>

          <QrDataProvider>
            <Route exact path="/qr-scan">
              <QrScan />
            </Route>

            <Route exact path="/display-results">
              <HealthCardDisplay />
            </Route>
          </QrDataProvider>
        </Switch>
      </ErrorBoundary>
    </Router>
  </ThemeProvider>
);

export default App;
