/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d4312b2cecd04cdd617d26f937c83f10>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { readUpdatableQueryEXPERIMENTALTest_node$fragmentType } from "./readUpdatableQueryEXPERIMENTALTest_node.graphql";
import type { readUpdatableQueryEXPERIMENTALTest_user$fragmentType } from "./readUpdatableQueryEXPERIMENTALTest_user.graphql";
export type readUpdatableQueryEXPERIMENTALTestRegularQuery$variables = {||};
export type readUpdatableQueryEXPERIMENTALTestRegularQuery$data = {|
  +me: ?{|
    +__id: string,
    +__isreadUpdatableQueryEXPERIMENTALTest_node?: "User",
    +author: ?{|
      +client_best_friend: ?{|
        +name: ?string,
      |},
      +client_nickname: ?string,
    |},
    +id: string,
    +name: ?string,
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_node$fragmentType,
  |},
  +node: ?{|
    +__typename: string,
    +__id: string,
    +name?: ?string,
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  |},
  +node2: ?{|
    +name?: ?string,
    +parents?: $ReadOnlyArray<{|
      +id: string,
      +name: ?string,
      +parents: $ReadOnlyArray<{|
        +id: string,
      |}>,
    |}>,
  |},
|};
export type readUpdatableQueryEXPERIMENTALTestRegularQuery = {|
  response: readUpdatableQueryEXPERIMENTALTestRegularQuery$data,
  variables: readUpdatableQueryEXPERIMENTALTestRegularQuery$variables,
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
  (v2/*: any*/)
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
  "selections": (v3/*: any*/),
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
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "parents",
      "plural": true,
      "selections": [
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "parents",
          "plural": true,
          "selections": [
            (v1/*: any*/)
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
    "name": "readUpdatableQueryEXPERIMENTALTestRegularQuery",
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
            "name": "readUpdatableQueryEXPERIMENTALTest_node"
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "__isreadUpdatableQueryEXPERIMENTALTest_node",
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
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
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  },
                  (v4/*: any*/)
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
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableQueryEXPERIMENTALTest_user"
          },
          (v6/*: any*/),
          (v0/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v8/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*: any*/)
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
    "name": "readUpdatableQueryEXPERIMENTALTestRegularQuery",
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
              (v6/*: any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": [
              (v1/*: any*/),
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
                      (v2/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v4/*: any*/)
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
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v1/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v8/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v9/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"5\")"
      }
    ]
  },
  "params": {
    "cacheID": "ece638c7f4d79a48e34a167dbdf0c3a1",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTestRegularQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryEXPERIMENTALTestRegularQuery {\n  me {\n    ...readUpdatableQueryEXPERIMENTALTest_node\n    id\n    name\n    author {\n      id\n    }\n  }\n  node(id: \"4\") {\n    __typename\n    ...readUpdatableQueryEXPERIMENTALTest_user\n    ... on User {\n      name\n    }\n    id\n  }\n  node2: node(id: \"5\") {\n    __typename\n    ... on User {\n      name\n      parents {\n        id\n        name\n        parents {\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment readUpdatableQueryEXPERIMENTALTest_node on Node {\n  __isNode: __typename\n  __typename\n}\n\nfragment readUpdatableQueryEXPERIMENTALTest_user on User {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "12785f1f4beff952cc20920d7c4bd1e2";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryEXPERIMENTALTestRegularQuery$variables,
  readUpdatableQueryEXPERIMENTALTestRegularQuery$data,
>*/);
