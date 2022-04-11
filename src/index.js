import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from 'components/App';
import reportWebVitals from './reportWebVitals';
import './i18n';

const renderReactDom = () => {
  ReactDOM.render(
    <React.StrictMode>
      <Suspense fallback="loading">
        <App />
      </Suspense>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    renderReactDom();
  }, false);
} else {
  renderReactDom();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
