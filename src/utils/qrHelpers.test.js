import { filterDuplicateImmunizations } from './qrHelpers';

const TEST_RESOURCE_ARRAY = [
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

describe('filterDuplicateImmunizations', () => {
  test('returns array of resources with unique immunization vaccine codes/occurrence dates', () => {
    const filteredResources = filterDuplicateImmunizations(TEST_RESOURCE_ARRAY);
    expect(filteredResources.length).toEqual(3);
    expect(filteredResources).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fullUrl: 'resource:3'
        })
      ])
    );
  });
});
