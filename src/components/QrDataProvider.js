import React, { createContext, useContext, useReducer } from 'react';
import { parseHealthCardQr, getJws, getPayload } from 'utils/qrHelpers';
import { Validator } from 'components/Validator/Validator.tsx';

const QrDataContext = createContext();

const initialState = {
  qrCodes: null,
  qrError: null,
  jws: null,
  validationStatus: {
    validPrimarySeries: null,
    error: null,
  },
};

const actions = {
  SET_QR_CODES: 'SET_QR_CODES',
  RESET_QR_CODES: 'RESET_QR_CODES',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_QR_CODES: {
      const newState = {};
      localStorage.setItem('qrCodes', JSON.stringify(action.qrCodes));

      if (action.qrCodes) {
        // check valid SHC QR
        const validShcQr = action.qrCodes.every(
          (c) => parseHealthCardQr(c) !== null
        );
        if (!validShcQr) {
          newState.qrError = 'UNSUPPORTED_QR_NOT_SHC';
          newState.jws = null;
        } else {
          newState.jws = getJws(action.qrCodes);
        }
      } else newState.jws = null;

      if (newState.jws) {
        // Validate vaccine series
        try {
          const payload = getPayload(newState.jws);
          const patientBundle = JSON.parse(payload).vc.credentialSubject.fhirBundle;
          const results = Validator.execute(patientBundle, 'COVID-19');
          newState.validationStatus = {
            validPrimarySeries: results.some(
              (series) => series.validPrimarySeries
            ),
            error: null,
          };
        } catch {
          newState.validationStatus = {
            validPrimarySeries: false,
            error: 'VALIDATION_ERROR',
          };
        }
      }
      return {
        ...state,
        ...newState,
      };
    }
    case actions.RESET_QR_CODES: {
      return initialState;
    }
    default:
      return state;
  }
};

const QrDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    qrCodes: state.qrCodes,
    jws: state.jws,
    qrError: state.qrError,
    validationStatus: state.validationStatus,
    setQrCodes: (qrCodes) => {
      dispatch({ type: actions.SET_QR_CODES, qrCodes });
    },
    resetQrCodes: () => {
      dispatch({ type: actions.RESET_QR_CODES });
    },
  };

  return (
    <QrDataContext.Provider value={value}>{children}</QrDataContext.Provider>
  );
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
