import axios from 'axios';
import https from 'https';

const defaultIssuerDirectories = [
  {
    name: 'VCI',
    URL: 'https://raw.githubusercontent.com/the-commons-project/vci-directory/main/vci-issuers.json'
  }
]

const agent = new https.Agent({
  rejectUnauthorized: false
});

const getIssuerDirectories = async () => Promise.all(defaultIssuerDirectories.map(async (d) => {
  const directory = d;
  let response;
  try {
    response = await axios.get(d.URL, { httpsAgent: agent });
  } catch (err) {
    directory.error = 'Error fetching issuer directory.';
    return directory;
  }

  directory.issuers = response.data;
  if (!directory.issuers?.participating_issuers) {
    directory.error = 'Incorrect issuer directory format.';
    return directory;
  }
  return directory;
}));

export default class IssuerDirectories {
  static async getIssuerDirectories() { return getIssuerDirectories(); }
}
