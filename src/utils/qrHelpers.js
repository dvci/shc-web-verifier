import { Base64 } from 'js-base64';
import pako from 'pako';

const getJws = (qrCodes) => (
  qrCodes.map((c) => {
    const sliceIndex = c.lastIndexOf('/');
    const rawPayload = c.slice(sliceIndex + 1);
    const encodingChars = rawPayload.match(/\d\d/g);
    return encodingChars.map((charPair) => String.fromCharCode(+charPair + 45)).join('');
  }).join('')
);

const getPayload = (qrCodes) => {
  const jwsString = getJws(qrCodes);
  const dataString = jwsString.split('.')[1];
  const decodedPayload = Base64.toUint8Array(dataString);
  const inflatedPayload = pako.inflateRaw(decodedPayload);
  const payload = new TextDecoder().decode(inflatedPayload);
  return payload;
};

const extractPatientName = (patient) => {
  const nameElement = patient.name[0];

  if (nameElement.text) {
    return nameElement.text;
  }

  const prefix = nameElement.prefix ? nameElement.prefix.join(' ') : '';
  const given = nameElement.given ? nameElement.given.join(' ') : '';
  const family = nameElement.family ? nameElement.family : '';
  const suffix = nameElement.suffix ? nameElement.suffix.join(' ') : '';

  const name = [prefix, given, family, suffix].join(' ');

  return name.trim();
};

const extractImmunizations = (bundle) => {
  const immunizationResources = bundle.entry
    .filter((entry) => entry.resource.resourceType === 'Immunization')

  return immunizationResources;
};

const extractPatientData = (card) => {
  const bundle = JSON.parse(card).vc.credentialSubject.fhirBundle;
  const patient = bundle.entry.find(
    (entry) => entry.resource.resourceType === 'Patient'
  ).resource;

  const name = extractPatientName(patient);
  const dateOfBirth = patient.birthDate;
  const immunizations = extractImmunizations(bundle);
  return { name, dateOfBirth, immunizations };
};

const getPatientData = (qrCodes) => {
  if (!qrCodes || qrCodes.length === 0) { return null; }
  const decodedQr = getPayload(qrCodes);
  return extractPatientData(decodedQr);
};

const getIssuer = (qrCodes) => {
  if (!qrCodes || qrCodes.length === 0) { return null; }
  const payload = JSON.parse(getPayload(qrCodes));
  return payload.iss;
};

export {
  extractImmunizations,
  extractPatientData,
  extractPatientName,
  getIssuer,
  getJws,
  getPatientData,
  getPayload
};
