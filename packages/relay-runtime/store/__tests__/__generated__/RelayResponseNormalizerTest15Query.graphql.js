/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bdfb845910cde51582e6b134ccb8c5ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest15Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest15QueryVariables = RelayResponseNormalizerTest15Query$variables;
export type RelayResponseNormalizerTest15Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +actor?: ?{|
      +id: string,
      +__typename: string,
    |},
    +author?: ?{|
      +id: string,
      +__typename: string,
    |},
  |},
|};
export type RelayResponseNormalizerTest15QueryResponse = RelayResponseNormalizerTest15Query$data;
export type RelayResponseNormalizerTest15Query = {|
  variables: RelayResponseNormalizerTest15QueryVariables,
  response: RelayResponseNormalizerTest15Query$data,
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  (v1/*: any*/),
  (v2/*: any*/)
],
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          }
        ],
        "type": "User",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest15Query",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest15Query",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "1ec08e1fccd2e07e6a5545b3b2603ec6",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest15Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest15Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actor {\n        id\n        __typename\n      }\n      author {\n        id\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0deabf7e08d064b7779b8ee647c5e2b3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest15Query$variables,
  RelayResponseNormalizerTest15Query$data,
>*/);
