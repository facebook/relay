/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<acff1998d3d5677e5a6caa5b8fdd41c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest23Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest23QueryVariables = RelayResponseNormalizerTest23Query$variables;
export type RelayResponseNormalizerTest23Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +name?: ?string,
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
          +emailAddresses: ?$ReadOnlyArray<?string>,
        |},
      |}>,
    |},
  |},
|};
export type RelayResponseNormalizerTest23QueryResponse = RelayResponseNormalizerTest23Query$data;
export type RelayResponseNormalizerTest23Query = {|
  variables: RelayResponseNormalizerTest23QueryVariables,
  response: RelayResponseNormalizerTest23Query$data,
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
v2 = [
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
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 2
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
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "emailAddresses",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:2)"
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
    "name": "RelayResponseNormalizerTest23Query",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest23Query",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "e47909ad3c9a97f4f976264bc75736df",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest23Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest23Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      name\n      friends(first: 2) {\n        edges {\n          node {\n            id\n            emailAddresses\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "82b2239f301580a3b5208d42c647521c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest23Query$variables,
  RelayResponseNormalizerTest23Query$data,
>*/);
