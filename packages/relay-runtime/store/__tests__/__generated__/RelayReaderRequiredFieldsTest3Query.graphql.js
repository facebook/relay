/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c2f0525e017e8b996663b3eaa057980a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest3Query$variables = {||};
export type RelayReaderRequiredFieldsTest3QueryVariables = RelayReaderRequiredFieldsTest3Query$variables;
export type RelayReaderRequiredFieldsTest3Query$data = {|
  +me: {|
    +lastName: string,
  |},
|};
export type RelayReaderRequiredFieldsTest3QueryResponse = RelayReaderRequiredFieldsTest3Query$data;
export type RelayReaderRequiredFieldsTest3Query = {|
  variables: RelayReaderRequiredFieldsTest3QueryVariables,
  response: RelayReaderRequiredFieldsTest3Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
    "name": "RelayReaderRequiredFieldsTest3Query",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
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
              "action": "THROW",
              "path": "me.lastName"
            }
          ],
          "storageKey": null
        },
        "action": "THROW",
        "path": "me"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest3Query",
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
    "cacheID": "8cd69a31b3db9176dc76e43d3a795c6f",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest3Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest3Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "87b6ffdc922687a788965139fef7a707";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest3Query$variables,
  RelayReaderRequiredFieldsTest3Query$data,
>*/);
