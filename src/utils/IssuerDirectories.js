import axios from 'axios';
import https from 'https';
import { Directory } from 'smart-health-card-decoder/src';

let directories = null; // Promise<Directory>
let untrustedIssuers = null; // Promise<Directory>

const defaultIssuerDirectories = [ // add additional default directory snapshots
];

const agent = new https.Agent({
  rejectUnauthorized: false
});

const fetchIssuerDirectories = async (controller) => {
  const vciDirectory = await Directory.create('vci'); // download daily VCI directory snapshot by default.

  const defaultDirectories = await Promise.all(
    defaultIssuerDirectories.map(async (d) => {
      let response;
      try {
        response = await
        axios.get(d.snapshotUrl, { httpsAgent: agent, signal: controller?.signal });
      } catch (err) {
        return null;
      }

      return Directory.create(response.data);
    })
  )

  directories = Directory.create([...defaultDirectories, vciDirectory]);
};

export default function getIssuerDirectories(controller) {
  if (!directories) {
    directories = fetchIssuerDirectories(controller);
  }

  return directories;
}

export function getOrAddUntrustedIssuer(iss) {
  if (untrustedIssuers) {
    untrustedIssuers.then((untrustedIssuersDirectory) => {
      if (!untrustedIssuersDirectory.find(iss)) {
        Directory.create([iss]).then((issDirectory) => {
          untrustedIssuers = Directory.create([untrustedIssuersDirectory, issDirectory]);
        })
      }
    });
  } else {
    untrustedIssuers = Directory.create([iss]);
  }

  return untrustedIssuers;
}
