/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<17c2f02db93bfb7fe81113a75cfc2661>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest2QueryVariables = {||};
export type RelayReaderRequiredFieldsTest2QueryResponse = {|
  +me: ?{|
    +firstName: ?string,
    +lastName: string,
  |},
|};
export type RelayReaderRequiredFieldsTest2Query = {|
  variables: RelayReaderRequiredFieldsTest2QueryVariables,
  response: RelayReaderRequiredFieldsTest2QueryResponse,
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
    "name": "RelayReaderRequiredFieldsTest2Query",
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
    "name": "RelayReaderRequiredFieldsTest2Query",
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
    "cacheID": "a2066f3dec12968c405df59b93ae569d",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest2Query {\n  me {\n    firstName\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "72f30114def75faa8eaacbb70e93d486";
}

module.exports = node;
