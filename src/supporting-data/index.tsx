import COVID from './AntigenSupportingData-COVID-19.json';

interface IAntigenSupportingData {
  [antigen: string]: any;
}

const supportingData = {
  'COVID-19': COVID,
} as IAntigenSupportingData;

export { supportingData };  
export type { IAntigenSupportingData };