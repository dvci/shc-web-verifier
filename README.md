# shc-web-verifier
Web application for verifying SMART Health Cards

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

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
* Cordova CLI
* Android platform SDK
* iOS platform SDK

### Install and build
```
yarn install
yarn build
cordova prepare
cordova build
```

## Client-side CDC CDSi validator

Limited scope, CQL engine based client-side validation script that executes the CDSi supporting data guidelines.

Currently only validates each non-Risk type series based on allowable series age to start, dose absMinAge, allowable vaccine codes (CVX only) and begin/end age, inadvertent vaccine codes (CVX only), absolute minimum preferable interval from previous dose (including effective and cessation dates), and absolute minimum allowable interval from previous dose.

Does not support forecasting or any other validation, including conditional doses, recurring or seasonal doses, immunity or contradictions.

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
