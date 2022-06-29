import { getLabTestCodeDisplay, getLabTestResultCodeDisplay } from './labValueSets'

test('Get LIVDSARSCoV2TestCodes', () => {
  const display = getLabTestCodeDisplay('http://loinc.org', '50548-7');
  expect(display).not.toBeNull();
  expect(display).toBe('Respiratory virus DNA+RNA [Identifier] in Unspecified specimen by NAA with probe detection');
});

test('LIVDSARSCoV2TestCodes unknown system', () => {
  const display = getLabTestCodeDisplay('unknown', '50548-7');
  expect(display).not.toBeNull();
  expect(display).toBe(undefined);
});

test('LIVDSARSCoV2TestCodes unknown code', () => {
  const display = getLabTestCodeDisplay('http://loinc.org', 'unknown');
  expect(display).not.toBeNull();
  expect(display).toBe(undefined);
});

test('Get LIVDSARSCoV2TestResultCodes', () => {
  const display = getLabTestResultCodeDisplay('http://snomed.info/sct', '10828004');
  expect(display).not.toBeNull();
  expect(display).toBe('Positive (qualifier value)');
});

test('LIVDSARSCoV2TestResultCodes unknown system', () => {
  const display = getLabTestResultCodeDisplay('unknown', '10828004');
  expect(display).not.toBeNull();
  expect(display).toBe(undefined);
});

test('LIVDSARSCoV2TestResultCodes unknown code', () => {
  const display = getLabTestResultCodeDisplay('http://snomed.info/sct', 'unknown');
  expect(display).not.toBeNull();
  expect(display).toBe(undefined);
});

test('Get QualitativeLabResultsLOINC', () => {
  const display = getLabTestResultCodeDisplay('http://loinc.org', 'LA11882-0');
  expect(display).not.toBeNull();
  expect(display).toBe('Detected');
});

test('QualitativeLabResultsLOINC unknown system', () => {
  const display = getLabTestResultCodeDisplay('unknown', 'LA11882-0');
  expect(display).not.toBeNull();
  expect(display).toBe(undefined);
});

test('QualitativeLabResultsLOINC unknown code', () => {
  const display = getLabTestResultCodeDisplay('http://loinc.org', 'unknown');
  expect(display).not.toBeNull();
  expect(display).toBe(undefined);
});
