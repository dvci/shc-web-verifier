import COVID from './AntigenSupportingData-COVID-19.json';
import ancillaryCOVID from './AntigenAncillaryData-COVID-19.json';

interface ISupportingData {
  [antigen: string]: any;
}

const supportingData = {
  'COVID-19': COVID
} as ISupportingData;

const ancillaryData = {
  'COVID-19': ancillaryCOVID
} as ISupportingData;

export { supportingData, ancillaryData };
export type { ISupportingData };
