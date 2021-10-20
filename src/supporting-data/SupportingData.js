// eslint-disable-next-line import/no-extraneous-dependencies
const xml2js = require('xml2js');
const fs = require('fs');

const myArgs = process.argv.slice(2);

const xml = fs.readFileSync(myArgs[0], 'utf8');

const stringToQuantity = (quantityString) => {
  if (quantityString === '') {
    return {};
  }
  const substrings = quantityString.split(' ');
  let quantityUnit;
  switch (substrings[1]) {
    case 'days': quantityUnit = 'd';
      break;
    case 'months': quantityUnit = 'mo';
      break;
    case 'years': quantityUnit = 'a';
      break;
    default: quantityUnit = '';
  }

  return {
    value: Number(substrings[0]),
    unit: quantityUnit
  };
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
    return elementToArray(newValue, 'allowableVaccine');
  }
  if (['/antigenSupportingData/series/seriesDose/allowableInterval'].includes(xpath)) {
    return elementToObject(newValue);
  }
  if (['/antigenSupportingData/series/seriesDose/age/absMinAge',
    '/antigenSupportingData/series/seriesDose/age/earliestRecAge',
    '/antigenSupportingData/series/seriesDose/allowableInterval/absMinInt'].includes(xpath)) {
    return stringToQuantity(newValue);
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
