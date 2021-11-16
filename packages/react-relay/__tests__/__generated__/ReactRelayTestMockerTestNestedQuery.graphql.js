/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8d72977fda0b6baf732a06cbcabfb4fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type ReactRelayTestMockerTestNestedQuery$variables = {||};
export type ReactRelayTestMockerTestNestedQueryVariables = ReactRelayTestMockerTestNestedQuery$variables;
export type ReactRelayTestMockerTestNestedQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +birthdate: ?{|
        +month: ?number,
      |},
    |},
  |},
|};
export type ReactRelayTestMockerTestNestedQueryResponse = ReactRelayTestMockerTestNestedQuery$data;
export type ReactRelayTestMockerTestNestedQuery = {|
  variables: ReactRelayTestMockerTestNestedQueryVariables,
  response: ReactRelayTestMockerTestNestedQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "Date",
  "kind": "LinkedField",
  "name": "birthdate",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "month",
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
    "name": "ReactRelayTestMockerTestNestedQuery",
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
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
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
    "name": "ReactRelayTestMockerTestNestedQuery",
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
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5fd4ecee5300e4f1e122a1db2b1fb8d7",
    "id": null,
    "metadata": {},
    "name": "ReactRelayTestMockerTestNestedQuery",
    "operationKind": "query",
    "text": "query ReactRelayTestMockerTestNestedQuery {\n  viewer {\n    actor {\n      __typename\n      birthdate {\n        month\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a6b9d9e49bf7ac7ae36777450d1ec30b";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayTestMockerTestNestedQuery$variables,
  ReactRelayTestMockerTestNestedQuery$data,
>*/);
