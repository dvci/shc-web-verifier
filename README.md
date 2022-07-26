# shc-web-verifier

Web application for verifying SMART Health Cards

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Windows users: You may require these commands when starting the verifier from gitbash\
`set BUILD_PATH="./www"`\
`yarn react-scripts start`\
If you encounter the error message: "Expected linebreaks to be 'LF' but found 'CRLF'  linebreak-style"\
run `npm run lint -- --fix` to fix the eol styling caused by Windows using CRLf instead of LF

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `www` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Mobile build

### Prerequisites

See https://cordova.apache.org/docs/en/latest/guide/cli/

- Cordova CLI
- Android platform SDK
- iOS platform SDK

### Install and build

```
yarn install
yarn build
cordova prepare
cordova build
```

### Create mobile icons
Ionic utility to create required icon densities for supported platforms from source 1024x0124 icon.
Will add files to resources folder and update config.xml file with icon paths.
```
yarn global add cordova-res
cordova-res --type icon --icon-source "src/assets/icon.png"
```

## Client-side CDC CDSi validator

The SMART Health Card verification process uses a limited-scope, Clinical Quality Language (CQL) engine-based, client-side [validation script](https://github.com/dvci/shc-web-verifier/blob/main/cql/CDSiSupportingData.cql) that executes the Clinical Decision Support for Immunization (CDSi) Supporting Data guidelines.

### CDSi Supporting Data

The CDSi Supporting Data guidelines are used to capture recommendations from the Advisory Committee on Immunization Practices (ACIP) for development and maintenance of Clinical Decision Support (CDS) engines. The Supporting Data describe, by antigen, the necessary attributes and specific values to support evaluation of vaccine series when implementing ACIP recommendations.

See the [CDSi Logic Specification and Supporting Data Guidelines](https://www.cdc.gov/vaccines/programs/iis/cdsi.html#logic) for more information.

### Using the CDSi Supporting Data

The web verifier utilizes the CDSi Supporting Data guidelines to easily stay up-to-date with the evolving ACIP recommendations. The CDSi Supporting Data are used as input to the [CQL](https://ecqi.healthit.gov/cql) engine. To run CQL validation, the SMART Health Card’s payload must contain the `#immunization` and `#covid19` Verifiable Credential (VC) types. This validation determines whether the vaccine series contained in the SMART Health Card is valid, using the CDSi Supporting Data. The results of the CQL validation appear on the display page after the SMART Health Card QR code is scanned. If the SMART Health Card does not contain these VC types, CQL validation is skipped. For more information on the VC types, see the [SMART Health Card specifications](https://spec.smarthealth.cards/vocabulary/).

The web application currently validates each non-Risk type series based on the following:

- Allowable series age to start
- Dose absolute minimum age
- Allowable vaccine codes (CVX only) and begin/end age
- Inadvertent vaccine codes (CVX only)
- Absolute minimum preferable interval from previous dose (including effective and cessation dates)
- Absolute minimum allowable interval from previous dose

The web application does not support forecasting or any other validation, including conditional doses, recurring or seasonal doses, immunity or contradictions.

### CQL Workflow

The Supporting Data guidelines are used to validate the vaccine series using the following CQL logic workflow:

- If a given series is a non-Risk type, the series will be “evaluated,” which means that the CQL logic will determine whether each dose in the antigen series is “valid” or “invalid.”
- To determine whether a given series dose is valid, the CQL determines whether the dose falls under the following criteria:
  - **Valid series age to start** the antigen series, if no previous immunization is present in the series
  - **Valid age for the vaccine to be administered**, based off the absolute minimum age for the vaccine dose administered to be considered valid
  - **Valid interval** between the immunization and previous immunization, if applicable
  - **Valid allowable interval** between the immunization and previous immunization, if applicable
  - **Valid allowable vaccine**, which may be administered outside the preferable vaccine recommendations but still counts toward immunity
  - **Not an inadvertent vaccine**
- After evaluating all the doses, the CQL will return whether the series is a valid primary series. To be a valid primary series, the number of valid doses must be greater than or equal to the minimum number of primary series doses specified for the series name in the [Antigen Ancillary Data](https://github.com/dvci/shc-web-verifier/blob/main/src/supporting-data/AntigenAncillaryData-COVID-19.json).

### Update CQL library

Convert CQL to ELM JSON and write results to src/output-elm.

Requires CQFramework CQL-to-ELM Translator Java tool to be built and installed locally. See [build instructions](https://github.com/cqframework/clinical_quality_language/tree/master/Src/java#generate-an-elm-representation-of-cql-logic).

```
/path/to/clinical_quality_language/Src/java/cql-to-elm/build/install/cql-to-elm/bin/cql-to-elm --input ./cql/CDSiSupportingData.cql --model ./cql/cdsi-modelinfo-1.0.0.xml --format JSON --output ./src/output-elm
```

### Update CDSi supporting data

Script to convert CDSi AntigenSupportingData XML format to json and write results to src/supporting-data.

```
node ./cql/SupportingData.js '/path/to/CDC/Version x.xx - 508/XML/AntigenSupportingData- COVID-19-508.xml'
```

Will need to be updated with each CDSi release. Primary vaccine series number of doses are defined separately in src/supporting-data/AncilarySupportingData-{antigen}.json

### Disable CDSi supporting data execution

To prevent the CDSi logic from executing and validating health cards, update the following configuration setting in src/components/App/App.config.js.

```
const config = {
  ENABLE_VALIDATION: false,
};
```

## Analytics

The deployed version of the SMART Health Card Verifier at https://dvci.github.io/shc-web-verifier uses [Clicky](https://clicky.com/) web analytics to track usage. This is done in a privacy-preserving way, and does not involve cookies. If you would like to remove or add your own tracking ID for local use, you may modify the `REACT_APP_MEASUREMENT_ID` environment variable in `.env`.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/dvci/shc-web-verifier. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [code of conduct](https://github.com/dvci/shc-web-verifier/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright 2021 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

```
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Code of Conduct

Everyone interacting with the project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/dvci/shc-web-verifier/blob/main/CODE_OF_CONDUCT.md).
