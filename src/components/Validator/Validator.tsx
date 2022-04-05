/* eslint-disable import/no-extraneous-dependencies */
import cql from '../../output-elm/CDSiSupportingData.json';
import fhirhelpers from '../../output-elm/FHIRHelpers-4.0.0.json';
import { supportingData, ancillaryData } from '../../supporting-data';

const { Repository, CodeService, PatientContext } = require('cql-execution');
const { PatientSource } = require('cql-exec-fhir');

interface IAntigenData {
  vcTypes: string[];
  antigen: string;
  supportingData: any;
  ancillaryData: any
}

const antigenData: IAntigenData[] = [
  {
    vcTypes: ["https://smarthealth.cards#covid19", "https://smarthealth.cards#health-card", "https://smarthealth.cards#immunization"], 
    antigen: 'COVID-19',
    supportingData: supportingData['COVID-19'].antigenSupportingData,
    ancillaryData: ancillaryData['COVID-19'].antigenAncillaryData
  }
];

const getAntigenData = (vcTypes: string[]) : IAntigenData | undefined => {
  vcTypes.sort((a, b) => a.localeCompare(b));
  return antigenData.find(antigen => antigen.vcTypes.length === vcTypes.length && vcTypes.every((type, index) => antigen.vcTypes[index] === type ));
};

export interface IValidationResult {
  seriesName: string;
  complete: [
    [
      {
        doseNumber: string,
        doseIndex: number,
        immunizationIndex: number,
        immunization: any
      },
    ],
  ];
}

export interface IValidationResults {
  results: IValidationResult[];
}

export class Validator {
  /**
   *
   * @param {Array} elmJSONs array of ELM JSON objects
   * @param {Object} patientBundle patient record to execute against
   * @param {Object} valueSetMap valueSetMap for CodeService
   * * @param {Object} parameters named params
   * @param {String} libraryID the library ID of the cql library corresponding to the ELM
   * @returns {Object} cql-execution-results
   */
  public static execute(
    patientBundle: any,
    vcTypes: string[],
    valueSetMap: any,
    elmJSONs: any[] = [cql, fhirhelpers],
    libraryID: string = 'CDSiSupportingData',
  ): [IValidationResult] | null {
    const mainELM = elmJSONs.find((e) => e.library.identifier.id === libraryID);
    if (!mainELM) {
      throw Error(`Cannot find ELM library with library id ${libraryID}`);
    }
    // Resolve dependencies
    const repository = new Repository(elmJSONs);
    const library = repository.resolve(
      libraryID,
      mainELM.library.identifier.version
    );

    const codeService = new CodeService(valueSetMap);
    const antigen = getAntigenData(vcTypes);
    if(!antigen) return null;
    const parameters = { 
      AntigenSupportingData: antigen.supportingData,
      AntigenAncillaryData: antigen.ancillaryData 
    };

    // Load array of patient bundles
    const patientSource = new PatientSource.FHIRv400();
    patientSource.loadBundles([patientBundle]);
    const expr = library.expressions.Run;
    const patientContext = new PatientContext(
      library,
      patientSource.currentPatient(),
      codeService,
      parameters,
    );
    return expr.execute(patientContext);
  }
}