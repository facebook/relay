/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1e9fa4ce70a99c6a360a1819faf7263f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest12Query$variables = {||};
export type RelayReaderRequiredFieldsTest12QueryVariables = RelayReaderRequiredFieldsTest12Query$variables;
export type RelayReaderRequiredFieldsTest12Query$data = {|
  +maybeNodeInterface: ?{|
    +name?: string,
  |},
|};
export type RelayReaderRequiredFieldsTest12QueryResponse = RelayReaderRequiredFieldsTest12Query$data;
export type RelayReaderRequiredFieldsTest12Query = {|
  variables: RelayReaderRequiredFieldsTest12QueryVariables,
  response: RelayReaderRequiredFieldsTest12Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest12Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "maybeNodeInterface",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "RequiredField",
                "field": (v0/*: any*/),
                "action": "LOG",
                "path": "maybeNodeInterface.name"
              }
            ],
            "type": "NonNodeNoID",
            "abstractKey": null
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
    "name": "RelayReaderRequiredFieldsTest12Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "maybeNodeInterface",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/)
            ],
            "type": "NonNodeNoID",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7bfa13099c5e7e5dc4f057901183fa57",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest12Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest12Query {\n  maybeNodeInterface {\n    __typename\n    ... on NonNodeNoID {\n      name\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0f4f82089cbe09323a0ea5925a8a4051";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest12Query$variables,
  RelayReaderRequiredFieldsTest12Query$data,
>*/);
