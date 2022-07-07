import { filterDuplicateImmunizations } from './qrHelpers';

const DUPLICATE_IMMUNIZATIONS_ARRAY = [
  {
    fullUrl: 'resource:0',
    resource: {
      resourceType: 'Patient',
      birthDate: '2000-01-01',
      name: {
        family: 'Anyperson',
        given: ['John', 'B.']
      }
    }
  },
  {
    fullUrl: 'resource:1',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '208'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-01-01',
      performer: [
        {
          actor: {
            display: 'ABC General Hospital'
          }
        }
      ],
      lotNumber: '0000001'
    }
  },
  {
    fullUrl: 'resource:2',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '213'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-02-01'
    }
  },
  {
    fullUrl: 'resource:3',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '213'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-02-01'
    }
  }
];

const DUPLICATE_DATE_ARRAY = [
  {
    fullUrl: 'resource:0',
    resource: {
      resourceType: 'Patient',
      birthDate: '2000-01-01',
      name: {
        family: 'Anyperson',
        given: ['John', 'B.']
      }
    }
  },
  {
    fullUrl: 'resource:1',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '208'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-01-01',
      performer: [
        {
          actor: {
            display: 'ABC General Hospital'
          }
        }
      ],
      lotNumber: '0000001'
    }
  },
  {
    fullUrl: 'resource:2',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '213'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-01-01',
      performer: [
        {
          actor: {
            display: 'ABC General Hospital'
          }
        }
      ],
      lotNumber: '0000001'
    }
  },
];

const DUPLICATE_CODE_ARRAY = [
  {
    fullUrl: 'resource:0',
    resource: {
      resourceType: 'Patient',
      birthDate: '2000-01-01',
      name: {
        family: 'Anyperson',
        given: ['John', 'B.']
      }
    }
  },
  {
    fullUrl: 'resource:1',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '208'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-01-01',
      performer: [
        {
          actor: {
            display: 'ABC General Hospital'
          }
        }
      ],
      lotNumber: '0000001'
    }
  },
  {
    fullUrl: 'resource:2',
    resource: {
      resourceType: 'Immunization',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '208'
          }
        ]
      },
      patient: {
        reference: 'resource:0'
      },
      occurrenceDateTime: '2021-02-01',
      performer: [
        {
          actor: {
            display: 'ABC General Hospital'
          }
        }
      ],
      lotNumber: '0000001'
    }
  },
];

describe('filterDuplicateImmunizations', () => {
  test('filters out resource with duplicate code, system, and occurrenceDateTime', () => {
    const filteredResources = filterDuplicateImmunizations(DUPLICATE_IMMUNIZATIONS_ARRAY);
    expect(filteredResources.length).toEqual(DUPLICATE_IMMUNIZATIONS_ARRAY.length - 1);
    expect(filteredResources).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fullUrl: 'resource:3'
        })
      ])
    );
  });

  test('does not filter out resource with same occurrenceDateTime but different code', () => {
    const filteredResources = filterDuplicateImmunizations(DUPLICATE_DATE_ARRAY);
    expect(filteredResources.length).toEqual(DUPLICATE_DATE_ARRAY.length);
  });

  test('does not filter out resource with same code but different occurrenceDateTime', () => {
    const filteredResources = filterDuplicateImmunizations(DUPLICATE_CODE_ARRAY);
    expect(filteredResources.length).toEqual(DUPLICATE_CODE_ARRAY.length);
  });
});
