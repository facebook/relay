/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<35bd73add0c448f8fb678e6939fdd567>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayConcreteVariablesTest2Query$variables = {|
  count?: ?number,
  id?: ?string,
  order?: ?ReadonlyArray<?string>,
|};
export type RelayConcreteVariablesTest2Query$data = {|
  +node: ?({|
    +__typename: "User",
    +friends: ?{|
      +edges: ?ReadonlyArray<?{|
        +node: ?{|
          +id: string,
        |},
      |}>,
    |},
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type RelayConcreteVariablesTest2Query = {|
  response: RelayConcreteVariablesTest2Query$data,
  variables: RelayConcreteVariablesTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": "beast",
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": [
    "name"
  ],
  "kind": "LocalArgument",
  "name": "order"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "count"
        },
        {
          "kind": "Variable",
          "name": "orderby",
          "variableName": "order"
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
                (v4/*:: as any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayConcreteVariablesTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v5/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "RelayConcreteVariablesTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
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
          (v5/*:: as any*/),
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a904845dd4734631f20b2a35cef6bae4",
    "id": null,
    "metadata": {},
    "name": "RelayConcreteVariablesTest2Query",
    "operationKind": "query",
    "text": "query RelayConcreteVariablesTest2Query(\n  $id: ID = \"beast\"\n  $count: Int = 10\n  $order: [String] = [\"name\"]\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      friends(first: $count, orderby: $order) {\n        edges {\n          node {\n            id\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "cc6f1551e100af7df55186ce5b1e53bb";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayConcreteVariablesTest2Query$variables,
  RelayConcreteVariablesTest2Query$data,
>*/);
