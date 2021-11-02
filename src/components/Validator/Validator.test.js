const {
  loadJSONFixture,
} = require('cql-testing-harness');
const { Validator } = require('./Validator.tsx');

const validPrimarySeries = (results) => {
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
  expect(validPrimarySeries(values)).toBe(false);
});

test('2nd dose of Pfizer Covid-19 Vaccine at 21 days', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0012.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('2nd dose of Covid-19 Vaccine different product (Moderna) at an interval of 28 days', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0015.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 of the Moderna Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0016.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('2nd dose of Moderna Covid-19 Vaccine at 28 days', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0017.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('2nd dose of Covid-19 Vaccine different product (Pfizer) at 28 days', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0020.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Unspecified Covid 19 vaccine given as dose #1', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0021.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Dose #1 of Pfizer Covid-19 Vaccine (age 12 years)', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0022.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Patient with no previous dose of vaccine (age 12 years)', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0023.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Dose #2 of Pfizer Covid-19 Vaccine at 21 days (age 12 years)', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2020-0025.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Patient is >18 years and has received the Janssen Covid-19 vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0001.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 of Covid 19 vaccine given as Pfizer, Dose #2 as Janssen', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0002.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 of Covid 19 vaccine given as Moderna Dose #2 as Janssen', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0003.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 Unspecified Covid 19 vaccine, Dose #2 given as Janssen', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0004.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Patient is <18 years and has received the Janssen Covid-19 vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0005.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 of a Non-U.S. Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0006.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Dose #1 and Dose #2 of a Non-U.S. Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0007.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 is Pfizer Dose #2 is Astra Zeneca Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0008.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Dose #1 is AstraZeneca Dose #2 is Pfizer Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0009.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Patient is 12 years old and was administered Moderna as first dose of Covid-19 vaccine.', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0010.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Dose #1 and dose #2 of the Novavax Covid-19 vaccine.', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0011.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #2 of the Novavax Covid-19 vaccine administered at an interval of 14 days.', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0012.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 of the Novavax Covid-19 Vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0014.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(false);
});

test('Patient is 65 years and has received two doses of the Pfizer Covid-19 vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0015.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Patient is 65 years and has been administered the third dose of the Pfizer Covid-19 vaccine at an interval of 6 months', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0018.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Patient is 65 years and has been administered the third dose of the Pfizer Covid-19 vaccine at an interval of 4 months after the most previous dose', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0019.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Patient is 65 years and has received a booster dose of the Moderna Covid-19 vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0020.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 Janssen Covid-19 and  Dose#2 Janssen Covid-19 vaccine.', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0022.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 Janssen Covid-19 and Dose #2 Moderna Covid-19 vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0023.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('Dose #1 Janssen Covid-19 and Dose #2 Pfizer Covid-19 vaccine', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0024.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});

test('2nd dose of Pfizer Covid-19 Vaccine at 21 - 5 days before ACIP instituted minimum interval', () => {
  const patientBundle = loadJSONFixture('./test/fixtures/patients/CDSi_2021-0025.json');
  const values = Validator.execute(patientBundle, 'COVID-19');
  expect(validPrimarySeries(values)).toBe(true);
});