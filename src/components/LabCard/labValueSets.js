import LIVDSARSCoV2TestCodes from './ValueSet-2.16.840.1.113762.1.4.1114.9.json';
import LIVDSARSCoV2TestResultCodes from './ValueSet-2.16.840.1.113762.1.4.1114.10.json';
import QualitativeLabResultsLOINC from './ValueSet-qualitative-lab-results-loinc.json';

const mapValueSets = () => {
  const valueSetResources = [
    LIVDSARSCoV2TestCodes,
    LIVDSARSCoV2TestResultCodes,
    QualitativeLabResultsLOINC];
  const valueSets = {};
  valueSetResources.forEach((valueSet) => {
    if (valueSet.compose && valueSet.url) {
      const valueSetId = valueSet.url;
      if (!valueSets[valueSetId]) {
        valueSets[valueSetId] = {};
      }

      valueSet.compose.include.forEach((include) => {
        if (include.system) {
          valueSets[valueSetId][include.system] = {};
          include.concept.forEach((concept) => {
            if (concept.code) {
              valueSets[valueSetId][include.system][concept.code] = concept.display;
            }
          });
        }
      });
    }
  });
  return valueSets;
}

const valueSetDictionary = mapValueSets();

const getLabTestCodeDisplay = (system, code) => (valueSetDictionary['http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1114.9'][system]
  ? valueSetDictionary['http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1114.9'][system][code] : undefined)

const getLabTestResultCodeDisplay = (system, code) => {
  if (valueSetDictionary['http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1114.10'][system]) {
    return valueSetDictionary['http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1114.10'][system][code]
  } if (valueSetDictionary['http://hl7.org/fhir/uv/shc-vaccination/ValueSet/qualitative-lab-results-loinc'][system]) {
    return valueSetDictionary['http://hl7.org/fhir/uv/shc-vaccination/ValueSet/qualitative-lab-results-loinc'][system][code];
  }
  return undefined;
}

export { getLabTestCodeDisplay, getLabTestResultCodeDisplay };
