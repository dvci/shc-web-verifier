import React, { FunctionComponent } from 'react';
import cql from '../../output-elm/CDSiSupportingData.json';
import fhirhelpers from '../../output-elm/FHIRHelpers-4.0.0.json';
import antigens from '../../supporting-data';

const {
  Repository,
  CodeService,
  PatientContext,
} = require('cql-execution');
const { PatientSource, FHIRWrapper } = require('cql-exec-fhir');

export interface IValidationResult {
    seriesName: string;
    complete: [
        [
            {
                doseNumber: string,
                doseIndex: number,
                immunizationIndex: number,
                immunization: any
            }
        ]
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
    libraryID: string = 'CDSiSupportingData'
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
    const fhirwrapper = new FHIRWrapper.FHIRv400();
    const parameters = { SeriesDefinition: fhirwrapper.wrap(antigens[antigen]) };

    // Load array of patient bundles
    const patientSource = new PatientSource.FHIRv400();
    patientSource.loadBundles([patientBundle]);
    const expr = library.expressions.Run;
    const patientContext = new PatientContext(
      library,
      patientSource.currentPatient(),
      codeService,
      parameters
    );
    return expr.execute(patientContext);
  }
}
