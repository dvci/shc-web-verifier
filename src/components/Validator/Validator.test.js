const {
  loadJSONFixture
} = require('cql-testing-harness');
const { Validator } = require('./Validator.tsx');

const seriesComplete = (results) => {
  const complete = results.some((series) => {
    if (series.complete.length > 0) {
      return true;
    }
    return false;
  });
  return complete;
};

test('Dose #1 of Pfizer Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0011.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(seriesComplete(values)).toBe(false);
});

test('2nd dose of Pfizer Covid-19 Vaccine at 21 days', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0012.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(seriesComplete(values)).toBe(true);
});
