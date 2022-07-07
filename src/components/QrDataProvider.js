import React, { createContext, useContext, useReducer } from 'react';
import {
  parseHealthCardQr, getJws, getPayload, filterDuplicateImmunizations
} from 'utils/qrHelpers';
import { Validator } from 'components/Validator/Validator.tsx';
import config from './App/App.config';

const QrDataContext = createContext();

const initialState = {
  qrCodes: [],
  qrError: null,
  jws: null,
  validationStatus: {
    validPrimarySeries: null,
    error: null
  },
  matchingDemographicData: null
};

const actions = {
  SET_QR_CODES: 'SET_QR_CODES',
  RESET_QR_CODES: 'RESET_QR_CODES',
  SET_QR_ERROR: 'SET_QR_ERROR'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_QR_CODES: {
      const newState = {};
      localStorage.setItem('qrCodes', JSON.stringify(action.qrCodes));

      if (action.qrCodes) {
        newState.qrCodes = action.qrCodes;
        // check valid SHC QR
        const validShcQr = action.qrCodes.flat().every((c) => parseHealthCardQr(c) !== null);
        if (!validShcQr) {
          newState.qrError = new Error('UNSUPPORTED_QR_NOT_SHC');
          newState.jws = null;
        } else {
          newState.jws = [];
          action.qrCodes.forEach((c) => {
            // change this based on whether already or not?
            const jws = getJws(c instanceof Array ? c : [c]);
            newState.jws.push(jws);
          });
        }
      } else newState.jws = null;

      if (newState.jws) {
        if (!config.ENABLE_VALIDATION) {
          newState.validationStatus = null;
        } else {
          // Validate vaccine series
          try {
            const combinedQRResources = [];
            let types = [];
            // store names and birth dates from patient resources for comparison
            const demographicData = [];

            newState.jws.forEach((jws) => {
              const payload = getPayload(jws);
              const patientBundle = JSON.parse(payload).vc.credentialSubject.fhirBundle;
              const patientResource = patientBundle.entry.find((e) => e.resource.resourceType === 'Patient');

              const patientDemographicData = {
                // store first given name that appears in array
                givenName: patientResource.resource.name[0].given?.join(' '),
                familyName: patientResource.resource.name[0].family,
                birthDate: patientResource.resource.birthDate,
                text: patientResource.resource.name[0].text
              };

              demographicData.push(patientDemographicData);

              // use one patient bundle for validation
              const existingPatientResource = combinedQRResources.find((e) => e.resource.resourceType === 'Patient');
              patientBundle.entry.forEach((e) => {
                if (
                  (e.resource.resourceType === 'Patient' && !existingPatientResource)
                  || e.resource.resourceType !== 'Patient'
                ) {
                  e.fullUrl = `resource:${combinedQRResources.length}`;
                  combinedQRResources.push(e);
                }
              });
              types = [...types, ...JSON.parse(payload).vc.type];
            });
            types = [...new Set(types)];
            const combinedPatientBundle = {
              type: 'collection',
              resourceType: 'Bundle',
              entry: filterDuplicateImmunizations(combinedQRResources)
            };
            const results = Validator.execute(combinedPatientBundle, types);

            newState.validationStatus = {
              validPrimarySeries: results
                ? results.some((series) => series.validPrimarySeries) : null,
              error: null
            };

            // check that text strings match across all cards if given/family names are not provided
            const matchingDemographicData = demographicData.every(
              (card) => ((card.givenName === demographicData[0].givenName
                && card.familyName === demographicData[0].familyName)
                || (card.text === demographicData[0].text))
                && card.birthDate === demographicData[0].birthDate
            );

            newState.matchingDemographicData = matchingDemographicData;
          } catch {
            newState.validationStatus = {
              validPrimarySeries: false,
              error: new Error('VALIDATION_ERROR')
            };
          }
        }
      }
      return {
        ...state,
        ...newState
      };
    }
    case actions.RESET_QR_CODES: {
      localStorage.setItem('qrCodes', null);
      return initialState;
    }
    case actions.SET_QR_ERROR: {
      if (action.qrError) {
        return {
          ...state,
          qrError: action.qrError
        };
      }
      return state;
    }
    default:
      return state;
  }
};

const QrDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    reducer,
    reducer(initialState, {
      type: actions.SET_QR_CODES,
      qrCodes: JSON.parse(localStorage.getItem('qrCodes'))
    })
  );

  const value = {
    qrCodes: state.qrCodes,
    jws: state.jws,
    qrError: state.qrError,
    validationStatus: state.validationStatus,
    matchingDemographicData: state.matchingDemographicData,
    setQrCodes: (qrCodes) => {
      dispatch({ type: actions.SET_QR_CODES, qrCodes });
    },
    resetQrCodes: () => {
      dispatch({ type: actions.RESET_QR_CODES });
    },
    setQrError: (qrError) => {
      dispatch({ type: actions.SET_QR_ERROR, qrError });
    }
  };

  return <QrDataContext.Provider value={value}>{children}</QrDataContext.Provider>;
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
