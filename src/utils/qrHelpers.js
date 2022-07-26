import { Base64 } from 'js-base64';
import pako from 'pako';
import getIssuerDirectories from './IssuerDirectories';

const healthCardPattern = /^shc:\/(?<multipleChunks>(?<chunkIndex>[0-9]+)\/(?<chunkCount>[0-9]+)\/)?(?<payload>[0-9]+)$/;

const parseHealthCardQr = (qrCode) => {
  if (healthCardPattern.test(qrCode)) {
    const match = qrCode.match(healthCardPattern);
    return match.groups;
  }
  return null;
};

const getJws = (qrCodes) => qrCodes
  .map((c) => {
    const sliceIndex = c.lastIndexOf('/');
    const rawPayload = c.slice(sliceIndex + 1);
    const encodingChars = rawPayload.match(/\d\d/g);
    return encodingChars.map((charPair) => String.fromCharCode(+charPair + 45)).join('');
  })
  .join('');

const getPayload = (jws) => {
  const dataString = jws.split('.')[1];
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
  const immunizationResources = bundle.entry.filter((entry) => entry.resource.resourceType === 'Immunization');
  return immunizationResources;
};

const extractObservations = (bundle) => {
  const observationResources = bundle.entry.filter((entry) => entry.resource.resourceType === 'Observation');
  return observationResources;
};

const filterDuplicateImmunizations = (resources) => {
  // filter immunization resources to those with unique
  // code, system, and occurrence dates
  const filteredResources = resources.filter(
    (r, index, self) => r.resource.resourceType !== 'Immunization'
      || self.findIndex(
        (e) => e.resource.occurrenceDateTime
        === r.resource.occurrenceDateTime
        && e.resource.vaccineCode.coding[0].code
        === r.resource.vaccineCode.coding[0].code
        && e.resource.vaccineCode.coding[0].system
        === r.resource.vaccineCode.coding[0].system
      ) === index
  );
  return filteredResources;
};

const extractPatientData = (card) => {
  const bundle = JSON.parse(card).vc.credentialSubject.fhirBundle;
  const patient = bundle.entry.find((entry) => entry.resource.resourceType === 'Patient').resource;

  const name = extractPatientName(patient);
  const dateOfBirth = patient.birthDate;
  const immunizations = extractImmunizations(bundle);
  const labResults = extractObservations(bundle);
  return {
    name, dateOfBirth, immunizations, labResults
  };
};

const getPatientData = (jws) => {
  if (!jws) {
    return null;
  }
  try {
    const decodedQr = getPayload(jws);
    const patientData = extractPatientData(decodedQr);
    return patientData;
  } catch {
    return null;
  }
};

const getIssuer = (jws) => {
  const payload = JSON.parse(getPayload(jws));
  return payload.iss;
};

const getIssuerDisplayName = async (jws, controller) => {
  const issuer = getIssuer(jws);
  // use VCI directory to resolve name
  const issuerDirectories = await getIssuerDirectories(controller);
  const participatingIssuers = issuerDirectories[0].issuers.participating_issuers;
  const issuerDisplayName = participatingIssuers.find((issObj) => issObj.iss === issuer).name;
  return issuerDisplayName;
};

const getCredential = (jws) => {
  const payload = JSON.parse(getPayload(jws));
  return payload.vc;
};

export {
  parseHealthCardQr,
  extractImmunizations,
  extractObservations,
  extractPatientData,
  extractPatientName,
  getIssuer,
  getJws,
  getPatientData,
  getPayload,
  getCredential,
  getIssuerDisplayName,
  filterDuplicateImmunizations
};
