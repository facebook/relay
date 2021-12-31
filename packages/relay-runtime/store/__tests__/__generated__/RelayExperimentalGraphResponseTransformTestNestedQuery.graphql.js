/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<21337bcaf11ecfca1d3b76cbe583fa01>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestNestedQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestNestedQueryVariables = RelayExperimentalGraphResponseTransformTestNestedQuery$variables;
export type RelayExperimentalGraphResponseTransformTestNestedQuery$data = {|
  +fetch__User: ?{|
    +name: ?string,
    +nearest_neighbor: {|
      +subscribeStatus: ?string,
    |},
  |},
|};
export type RelayExperimentalGraphResponseTransformTestNestedQueryResponse = RelayExperimentalGraphResponseTransformTestNestedQuery$data;
export type RelayExperimentalGraphResponseTransformTestNestedQuery = {|
  variables: RelayExperimentalGraphResponseTransformTestNestedQueryVariables,
  response: RelayExperimentalGraphResponseTransformTestNestedQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "100"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subscribeStatus",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestNestedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "nearest_neighbor",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": "fetch__User(id:\"100\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayExperimentalGraphResponseTransformTestNestedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "fetch__User",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "nearest_neighbor",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": "fetch__User(id:\"100\")"
      }
    ]
  },
  "params": {
    "cacheID": "3827e32b14adcebc4bbe1db66134470c",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestNestedQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestNestedQuery {\n  fetch__User(id: \"100\") {\n    name\n    nearest_neighbor {\n      subscribeStatus\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7505db301d80caeb3387591272e7def5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestNestedQuery$variables,
  RelayExperimentalGraphResponseTransformTestNestedQuery$data,
>*/);
