/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<22c2adb07213e23cfedaeb3ffafaa615>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest11Query$variables = {||};
export type RelayReaderRequiredFieldsTest11QueryVariables = RelayReaderRequiredFieldsTest11Query$variables;
export type RelayReaderRequiredFieldsTest11Query$data = {|
  +viewer: ?{|
    +allTimezones: $ReadOnlyArray<?{|
      +timezone: ?string,
    |}>,
  |},
|};
export type RelayReaderRequiredFieldsTest11QueryResponse = RelayReaderRequiredFieldsTest11Query$data;
export type RelayReaderRequiredFieldsTest11Query = {|
  variables: RelayReaderRequiredFieldsTest11QueryVariables,
  response: RelayReaderRequiredFieldsTest11Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "TimezoneInfo",
  "kind": "LinkedField",
  "name": "allTimezones",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "timezone",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest11Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": (v0/*: any*/),
            "action": "NONE",
            "path": "viewer.allTimezones"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest11Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c977e421b5e5766b30b6ef939af5b05d",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest11Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest11Query {\n  viewer {\n    allTimezones {\n      timezone\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "254cc83ae0a3a97198970624467d0ae2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest11Query$variables,
  RelayReaderRequiredFieldsTest11Query$data,
>*/);
