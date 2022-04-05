/* eslint-disable import/no-extraneous-dependencies */
import cql from '../../output-elm/CDSiSupportingData.json';
import fhirhelpers from '../../output-elm/FHIRHelpers-4.0.0.json';

const { Repository, CodeService, PatientContext } = require('cql-execution');
const { PatientSource } = require('cql-exec-fhir');
const { supportingData, ancillaryData } = require('../../supporting-data');

export interface IValidationResult {
  seriesName: string;
  validPrimarySeries: boolean,
  evaluations: [
    startingImmunizationIndex: number,
    validPrimarySeries: boolean,
    doseEvaluations: [
      {
        doseNumber: string,
        doseIndex: number,
        immunizationIndex: number,
        immunization: any,
        validDose: boolean
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
    antigen: string,
    valueSetMap: any,
    elmJSONs: any[] = [cql, fhirhelpers],
    libraryID: string = 'CDSiSupportingData',
  ): [IValidationResult] {
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
    const parameters = { 
      AntigenSupportingData: supportingData[antigen].antigenSupportingData,
      AntigenAncillaryData: ancillaryData[antigen].antigenAncillaryData 
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