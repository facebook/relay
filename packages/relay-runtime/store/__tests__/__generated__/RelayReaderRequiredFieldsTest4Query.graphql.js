/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7a02a49cb84c3e30f4bc63feec310660>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest4Query$variables = {||};
export type RelayReaderRequiredFieldsTest4QueryVariables = RelayReaderRequiredFieldsTest4Query$variables;
export type RelayReaderRequiredFieldsTest4Query$data = {|
  +me: ?{|
    +lastName: string,
    +firstName: string,
  |},
|};
export type RelayReaderRequiredFieldsTest4QueryResponse = RelayReaderRequiredFieldsTest4Query$data;
export type RelayReaderRequiredFieldsTest4Query = {|
  variables: RelayReaderRequiredFieldsTest4QueryVariables,
  response: RelayReaderRequiredFieldsTest4Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest4Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": (v0/*: any*/),
            "action": "LOG",
            "path": "me.lastName"
          },
          {
            "kind": "RequiredField",
            "field": (v1/*: any*/),
            "action": "LOG",
            "path": "me.firstName"
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
    "name": "RelayReaderRequiredFieldsTest4Query",
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
    "cacheID": "60d6981d1a997cd2b32b627df35d2637",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest4Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest4Query {\n  me {\n    lastName\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fa8d3866877354b875fa7d375217dfb9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest4Query$variables,
  RelayReaderRequiredFieldsTest4Query$data,
>*/);
