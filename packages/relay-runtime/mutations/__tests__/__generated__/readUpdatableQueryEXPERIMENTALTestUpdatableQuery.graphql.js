/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fec53e1f793fe0a54fb7a696056cc293>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type readUpdatableQueryEXPERIMENTALTest_node$fragmentType = any;
type readUpdatableQueryEXPERIMENTALTest_user$fragmentType = any;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables = {||};
export type readUpdatableQueryEXPERIMENTALTestUpdatableQueryVariables = readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data = {|
  get me(): ?{|
    +__typename: string,
    +__id: string,
    +id: string,
    name: ?string,
    get author(): ?{|
      get client_best_friend(): ?{|
        name: ?string,
      |},
      set client_best_friend(value: ?{
        +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
        +__typename: "User",
        +__id: string,
        ...
      }): void,
    |},
    set author(value: null | void): void,
    get author2(): ?{|
      client_nickname: ?string,
    |},
    set author2(value: null | void): void,
  |},
  set me(value: ?{
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
    +__typename: "User",
    +__id: string,
    ...
  }): void,
  get node(): ?({|
    +__typename: "User",
    name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
  set node(value: null | void): void,
  get node2(): ?({|
    +__typename: "User",
    name: ?string,
    get parents(): $ReadOnlyArray<{|
      name: ?string,
      get parents(): $ReadOnlyArray<{|
        name: ?string,
      |}>,
      set parents(value: []): void,
    |}>,
    set parents(value: $ReadOnlyArray<{
      +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
      +__typename: "User",
      +__id: string,
      ...
    }>): void,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
  set node2(value: null | void): void,
  get node3(): ?{|
    +id: string,
  |},
  set node3(value: ?{
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_node$fragmentType,
    +__isreadUpdatableQueryEXPERIMENTALTest_node: string,
    +__id: string,
    ...
  }): void,
|};
export type readUpdatableQueryEXPERIMENTALTestUpdatableQueryResponse = readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery = {|
  variables: readUpdatableQueryEXPERIMENTALTestUpdatableQueryVariables,
  response: readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
v3 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "readUpdatableQueryEXPERIMENTALTest_user"
},
v4 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "client_nickname",
      "storageKey": null
    }
  ]
},
v5 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v6 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
],
v7 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "5"
  }
],
v8 = [
  (v2/*: any*/)
],
v9 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "6"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryEXPERIMENTALTestUpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
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
                    "selections": [
                      (v3/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "storageKey": null
          },
          {
            "alias": "author2",
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": [
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "parents",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "parents",
                    "plural": true,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"5\")"
      },
      {
        "alias": "node3",
        "args": (v9/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableQueryEXPERIMENTALTest_node"
          }
        ],
        "storageKey": "node(id:\"6\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "readUpdatableQueryEXPERIMENTALTestUpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
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
                      (v0/*: any*/),
                      (v2/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "storageKey": null
          },
          {
            "alias": "author2",
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": (v8/*: any*/),
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
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
                  (v0/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "parents",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"5\")"
      },
      {
        "alias": "node3",
        "args": (v9/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": "node(id:\"6\")"
      }
    ]
  },
  "params": {
    "cacheID": "e2512e79cf0f66aef65bce22940b82cb",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTestUpdatableQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryEXPERIMENTALTestUpdatableQuery {\n  me {\n    __typename\n    id\n    name\n    author {\n      id\n    }\n    author2: author {\n      id\n    }\n    ...readUpdatableQueryEXPERIMENTALTest_user\n  }\n  node(id: \"4\") {\n    __typename\n    ... on User {\n      __typename\n      name\n    }\n    id\n  }\n  node2: node(id: \"5\") {\n    __typename\n    ... on User {\n      __typename\n      name\n      parents {\n        ...readUpdatableQueryEXPERIMENTALTest_user\n        name\n        parents {\n          name\n          id\n        }\n        id\n      }\n    }\n    id\n  }\n  node3: node(id: \"6\") {\n    __typename\n    id\n    ...readUpdatableQueryEXPERIMENTALTest_node\n  }\n}\n\nfragment readUpdatableQueryEXPERIMENTALTest_node on Node {\n  __isNode: __typename\n  __typename\n}\n\nfragment readUpdatableQueryEXPERIMENTALTest_user on User {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "91a7122121c1d4d4b99ee4b8155b4fbd";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables,
  readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data,
>*/);
