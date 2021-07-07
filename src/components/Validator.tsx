import React, { FunctionComponent } from 'react';
import cql from "../output-elm/CDSiSupportingData.json";
import fhirhelpers from "../output-elm/FHIRHelpers-4.0.0.json";
import antigens from '../supporting-data';
const {
  Repository,
  CodeService,
  PatientContext,
} = require("cql-execution");
const { PatientSource, FHIRWrapper } = require("cql-exec-fhir");

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

export interface IValidationResultProps {
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
    valueSetMap: any,
    antigen: string,
    elmJSONs: any[] = [cql, fhirhelpers],
    libraryID: string = "CDSiSupportingData"
    ): [IValidationResult] {
    // 'main' ELM is the mcode library
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
    const parameters = {SeriesDefinition: fhirwrapper.wrap(antigens[antigen])};

    // Load array of patient bundles
    const patientSource = new PatientSource.FHIRv400();
    patientSource.loadBundles([patientBundle]);
    const expr = library.expressions["Run"];
    const patient_ctx = new PatientContext(
      library,
      patientSource.currentPatient(),
      codeService,
      parameters
    );
    return expr.execute(patient_ctx);
  }
}

export const Card: FunctionComponent<IValidationResultProps> = ({results}) => <aside>
    <table>
        <tbody>
        {results.map((series) => {
          return (
            <tr>{series.seriesName}:
            {series.complete.map(complete => 
            <div>{complete.map(item => 
                <div>{item.doseNumber}: {JSON.stringify(item.immunization)}</div>
            )}
            </div>)}
            </tr>
          );
        })}
        </tbody>
    </table>
</aside>
