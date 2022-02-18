import axios from 'axios';
import tradenamesXml from './iisstandards_tradename.xml';
import cvxXml from './iisstandards_cvx.xml';

let tradenames = null;
let cvx = null;

function encodeEntity(xmlString) {
  return xmlString
    .replace(/<\?xml.*\?>/g, '')
    .replace(/&(?!amp;)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchCdcXml(file) {
  const response = await axios.get(file, {
    Accept: 'application/xml',
  });
  let data = await response.data;
  data = encodeEntity(data)
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    const parseerror = xmlDoc.getElementsByTagName('parsererror')[0].textContent;
    throw new Error(`Error parsing XML ${file}: ${parseerror}`);
  }
  return xmlDoc;
}

function processTradenames(xmlDoc) {
  const prodInfos = xmlDoc.evaluate(
    '//productnames/prodInfo',
    xmlDoc,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null
  );
  let prodInfo = prodInfos.iterateNext();
  const tn = {};
  while (prodInfo) {
    if (tn[prodInfo.children[5].textContent.trim()]) {
      tn[prodInfo.children[5].textContent.trim()] = prodInfo.children[3].textContent;
    } else {
      tn[prodInfo.children[5].textContent.trim()] = prodInfo.children[1].textContent;
    }

    prodInfo = prodInfos.iterateNext();
  }
  return tn;
}

function processCvx(xmlDoc) {
  const prodInfos = xmlDoc.evaluate(
    '//CVXCodes/CVXInfo',
    xmlDoc,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null
  );
  let prodInfo = prodInfos.iterateNext();
  const cvxDesc = {};
  while (prodInfo) {
    cvxDesc[prodInfo.getElementsByTagName('CVXCode')[0].textContent.trim()] = prodInfo.getElementsByTagName('ShortDescription')[0].textContent;
    prodInfo = prodInfos.iterateNext();
  }
  return cvxDesc;
}

function fetchTradenames() {
  if (!tradenames) {
    tradenames = fetchCdcXml(tradenamesXml)
      .then((xmlDoc) => processTradenames(xmlDoc))
  }

  return tradenames;
}

function fetchCvx() {
  if (!cvx) {
    cvx = fetchCdcXml(cvxXml)
      .then((xmlDoc) => processCvx(xmlDoc))
  }

  return cvx;
}

export { fetchTradenames, fetchCvx, encodeEntity };
