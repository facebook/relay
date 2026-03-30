/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<444823da65fcf634801cb3ecf7219e0a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest15Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest15Query$data = {|
  +node: ?{|
    +__typename: string,
    +actor?: ?{|
      +__typename: string,
      +id: string,
    |},
    +author?: ?{|
      +__typename: "User",
      +id: string,
    |},
    +id: string,
  |},
|};
export type RelayResponseNormalizerTest15Query = {|
  response: RelayResponseNormalizerTest15Query$data,
  variables: RelayResponseNormalizerTest15Query$variables,
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
  (v1/*:: as any*/),
  (v2/*:: as any*/)
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
      (v1/*:: as any*/),
      (v2/*:: as any*/),
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
            "selections": (v3/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": (v3/*:: as any*/),
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest15Query",
    "selections": (v4/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest15Query",
    "selections": (v4/*:: as any*/)
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
  (node/*:: as any*/).hash = "0deabf7e08d064b7779b8ee647c5e2b3";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest15Query$variables,
  RelayResponseNormalizerTest15Query$data,
>*/);
