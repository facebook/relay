/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fd0a64922bdf29c28ffbdffb95353307>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReferenceMarkerTestInnerQuery$variables = {|
  id: string,
|};
export type RelayReferenceMarkerTestInnerQueryVariables = RelayReferenceMarkerTestInnerQuery$variables;
export type RelayReferenceMarkerTestInnerQuery$data = {|
  +node: ?{|
    +name?: ?string,
  |},
|};
export type RelayReferenceMarkerTestInnerQueryResponse = RelayReferenceMarkerTestInnerQuery$data;
export type RelayReferenceMarkerTestInnerQuery = {|
  variables: RelayReferenceMarkerTestInnerQueryVariables,
  response: RelayReferenceMarkerTestInnerQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTestInnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReferenceMarkerTestInnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
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
    "cacheID": "fc5c304dae91ac99c643cf8e8c190b01",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTestInnerQuery",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTestInnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4c6a9934bb55d4c7f8779a65a12773c9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTestInnerQuery$variables,
  RelayReferenceMarkerTestInnerQuery$data,
>*/);
