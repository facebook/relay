/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3f1c52cea4dce679e4925dd7a11c5b7e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { readUpdatableQueryTest_node$fragmentType } from "./readUpdatableQueryTest_node.graphql";
import type { readUpdatableQueryTest_user$fragmentType } from "./readUpdatableQueryTest_user.graphql";
export type readUpdatableQueryTestRegularQuery$variables = {||};
export type readUpdatableQueryTestRegularQuery$data = {|
  +me: ?{|
    +__id: string,
    +__isreadUpdatableQueryTest_node?: "User",
    +author: ?{|
      +client_best_friend: ?{|
        +name: ?string,
      |},
      +client_nickname: ?string,
    |},
    +id: string,
    +name: ?string,
    +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
  |},
  +node: ?({|
    +__typename: "User",
    +__id: string,
    +name: ?string,
    +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
  +node2: ?({|
    +__typename: "User",
    +name: ?string,
    +parents: ReadonlyArray<{|
      +id: string,
      +name: ?string,
      +parents: ReadonlyArray<{|
        +id: string,
      |}>,
    |}>,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type readUpdatableQueryTestRegularQuery = {|
  response: readUpdatableQueryTestRegularQuery$data,
  variables: readUpdatableQueryTestRegularQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__id",
  "storageKey": null
},
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
  "name": "name",
  "storageKey": null
},
v3 = [
  (v2/*:: as any*/)
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "client_nickname",
  "storageKey": null
},
v5 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "kind": "InlineFragment",
  "selections": (v3/*:: as any*/),
  "type": "User",
  "abstractKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "5"
  }
],
v9 = {
  "kind": "InlineFragment",
  "selections": [
    (v2/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "parents",
      "plural": true,
      "selections": [
        (v1/*:: as any*/),
        (v2/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "parents",
          "plural": true,
          "selections": [
            (v1/*:: as any*/)
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryTestRegularQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableQueryTest_node"
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "__isreadUpdatableQueryTest_node",
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          (v0/*:: as any*/),
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": [
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "client_best_friend",
                    "plural": false,
                    "selections": (v3/*:: as any*/),
                    "storageKey": null
                  },
                  (v4/*:: as any*/)
                ]
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v5/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableQueryTest_user"
          },
          (v6/*:: as any*/),
          (v0/*:: as any*/),
          (v7/*:: as any*/)
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v8/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*:: as any*/)
        ],
        "storageKey": "node(id:\"5\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "readUpdatableQueryTestRegularQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v6/*:: as any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "client_best_friend",
                    "plural": false,
                    "selections": [
                      (v2/*:: as any*/),
                      (v1/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  (v4/*:: as any*/)
                ]
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v5/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*:: as any*/),
          (v1/*:: as any*/),
          (v7/*:: as any*/)
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v8/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*:: as any*/),
          (v9/*:: as any*/),
          (v1/*:: as any*/)
        ],
        "storageKey": "node(id:\"5\")"
      }
    ]
  },
  "params": {
    "cacheID": "fc873ac420848e8fa3d8286d9837b2a6",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryTestRegularQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryTestRegularQuery {\n  me {\n    ...readUpdatableQueryTest_node\n    id\n    name\n    author {\n      id\n    }\n  }\n  node(id: \"4\") {\n    __typename\n    ...readUpdatableQueryTest_user\n    ... on User {\n      name\n    }\n    id\n  }\n  node2: node(id: \"5\") {\n    __typename\n    ... on User {\n      name\n      parents {\n        id\n        name\n        parents {\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment readUpdatableQueryTest_node on Node {\n  __isNode: __typename\n  __typename\n}\n\nfragment readUpdatableQueryTest_user on User {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "46eea2f5976dc4bcb1af1d5b7479d9b8";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  readUpdatableQueryTestRegularQuery$variables,
  readUpdatableQueryTestRegularQuery$data,
>*/);
