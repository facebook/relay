/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4951927199975057b16338acddcc9a00>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest1Query$variables = {||};
export type RelayReaderRequiredFieldsTest1QueryVariables = RelayReaderRequiredFieldsTest1Query$variables;
export type RelayReaderRequiredFieldsTest1Query$data = {|
  +me: ?{|
    +firstName: ?string,
    +lastName: string,
  |},
|};
export type RelayReaderRequiredFieldsTest1QueryResponse = RelayReaderRequiredFieldsTest1Query$data;
export type RelayReaderRequiredFieldsTest1Query = {|
  variables: RelayReaderRequiredFieldsTest1QueryVariables,
  response: RelayReaderRequiredFieldsTest1Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest1Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "kind": "RequiredField",
            "field": (v1/*: any*/),
            "action": "LOG",
            "path": "me.lastName"
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
    "name": "RelayReaderRequiredFieldsTest1Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "30b5a8332673c1d594cb3bb389440b85",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest1Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest1Query {\n  me {\n    firstName\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "81351b34c481771ea47e3a0a2b0e97f1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest1Query$variables,
  RelayReaderRequiredFieldsTest1Query$data,
>*/);
