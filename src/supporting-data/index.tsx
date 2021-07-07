import COVID from './AntigenSupportingData- COVID-19-508.parameters.json';

export interface IAntigens {
    [antigen: string]: any;
}

const antigens: IAntigens = {
    'COVID-19-508': COVID
};

export default antigens;