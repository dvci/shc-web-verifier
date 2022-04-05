// eslint-disable-next-line import/no-extraneous-dependencies
const xml2js = require('xml2js');
const fs = require('fs');

const myArgs = process.argv.slice(2);

const xml = fs.readFileSync(myArgs[0], 'utf8');

const stringToIsoDate = (value) => {
  if (value === '') {
    return null;
  }
  if (value.length !== 8) {
    throw new Error(`Invalid date ${value}`);
  }
  return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6)}`;
}

const stringToQuantityUnit = (quantityUnit) => {
  if (quantityUnit === '') {
    return '';
  }
  const validQuantityUnits = ['day', 'week', 'month', 'year', 'days', 'weeks', 'months', 'years']
  if (!validQuantityUnits.includes(quantityUnit)) {
    throw new Error(`Invalid date unit ${quantityUnit}`);
  }
  return quantityUnit;
}

const stringToQuantity = (quantityString) => {
  if (quantityString === '') {
    return [];
  }
  const substrings = quantityString.split(' ');
  const quantityUnit = stringToQuantityUnit(substrings[1]);
  if (substrings.length < 3) {
    return [{
      value: parseFloat(substrings[0]),
      unit: quantityUnit
    }];
  }

  const gracePeriodValue = substrings[2] + substrings[3];
  const gracePeriodUnit = stringToQuantityUnit(substrings[4]);

  return [{
    value: parseFloat(substrings[0]),
    unit: quantityUnit
  },
  {
    value: parseFloat(gracePeriodValue),
    unit: gracePeriodUnit
  }];
};

const elementToArray = (value, item) => {
  const newValue = value;
  if (!Array.isArray(value[item])) { newValue[item] = [newValue[item]] }
  return newValue;
}

const elementToObject = (value) => {
  if (value === '') {
    return {};
  }
  return value;
}

const validator = (xpath, currentValue, newValue) => {
  if (['/antigenSupportingData/series'].includes(xpath)) {
    return elementToArray(newValue, 'seriesDose');
  }
  if (['/antigenSupportingData/series/seriesDose'].includes(xpath)) {
    let seriesDose = elementToArray(newValue, 'interval');
    seriesDose = elementToArray(newValue, 'allowableInterval');
    seriesDose = elementToArray(newValue, 'allowableVaccine');
    seriesDose = elementToArray(newValue, 'inadvertentVaccine');
    return seriesDose;
  }
  if (['/antigenSupportingData/series/seriesDose/interval',
    '/antigenSupportingData/series/seriesDose/allowableInterval',
    '/antigenSupportingData/series/seriesDose/allowableVaccine',
    '/antigenSupportingData/series/seriesDose/inadvertentVaccine'].includes(xpath)) {
    return elementToObject(newValue);
  }
  if (['/antigenSupportingData/series/selectSeries/minAgeToStart',
    '/antigenSupportingData/series/selectSeries/maxAgeToStart',
    '/antigenSupportingData/series/seriesDose/age/absMinAge',
    '/antigenSupportingData/series/seriesDose/interval/absMinInt',
    '/antigenSupportingData/series/seriesDose/allowableInterval/absMinInt',
    '/antigenSupportingData/series/seriesDose/allowableVaccine/beginAge',
    '/antigenSupportingData/series/seriesDose/allowableVaccine/endAge'].includes(xpath)) {
    return stringToQuantity(newValue);
  }
  if (['/antigenSupportingData/series/seriesDose/interval/effectiveDate',
    '/antigenSupportingData/series/seriesDose/interval/cessationDate',
    '/antigenSupportingData/series/seriesDose/allowableInterval/effectiveDate',
    '/antigenSupportingData/series/seriesDose/allowableInterval/cessationDate'].includes(xpath)) {
    return stringToIsoDate(newValue);
  }
  return newValue
}

xml2js.parseString(xml, { explicitArray: false, validator },
  (err, result) => {
    if (err) {
      throw err;
    }

    const json = JSON.stringify(result, null, 4);
    const { vaccineGroup } = result.antigenSupportingData.series[0];
    fs.writeFileSync(`./src/supporting-data/AntigenSupportingData-${vaccineGroup}.json`, json);
  });
