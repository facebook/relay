/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<13cca1e1a2dbec5294b50cd0e11aae61>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest40Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest40Query$data = {|
  +node: ?{|
    +__typename: string,
    +friends?: ?{|
      +edges: ?ReadonlyArray<?{|
        +cursor: ?string,
      |}>,
    |},
    +id: string,
  |},
|};
export type RelayResponseNormalizerTest40Query = {|
  response: RelayResponseNormalizerTest40Query$data,
  variables: RelayResponseNormalizerTest40Query$variables,
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
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
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 3
              }
            ],
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FriendsEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:3)"
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
    "name": "RelayResponseNormalizerTest40Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest40Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "251f330024d4e62594c5e159c4c53eb6",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest40Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest40Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      friends(first: 3) {\n        edges {\n          cursor\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "47f5818254b0edfc622fea65015a498e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest40Query$variables,
  RelayResponseNormalizerTest40Query$data,
>*/);
