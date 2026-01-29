/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f8d1a944cd7bd9d37d021fe9ff7302be>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
import type { readUpdatableQueryTest_node$fragmentType } from "./readUpdatableQueryTest_node.graphql";
import type { readUpdatableQueryTest_user$fragmentType } from "./readUpdatableQueryTest_user.graphql";
export type readUpdatableQueryTestUpdatableQuery$variables = {||};
export type readUpdatableQueryTestUpdatableQuery$data = {|
  get me(): ?{|
    +__typename: "User",
    +__id: string,
    +id: string,
    name: ?string,
    get author(): ?{|
      get client_best_friend(): ?{|
        name: ?string,
      |},
      set client_best_friend(value: ?{
        +__typename: "User",
        +__id: string,
        +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
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
    +__typename: "User",
    +__id: string,
    +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
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
    get parents(): ReadonlyArray<{|
      name: ?string,
      get parents(): ReadonlyArray<{|
        name: ?string,
      |}>,
      set parents(value: []): void,
    |}>,
    set parents(value: ReadonlyArray<{
      +__typename: "User",
      +__id: string,
      +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
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
    +__id: string,
    +__isreadUpdatableQueryTest_node: string,
    +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
    ...
  }): void,
|};
export type readUpdatableQueryTestUpdatableQuery = {|
  response: readUpdatableQueryTestUpdatableQuery$data,
  variables: readUpdatableQueryTestUpdatableQuery$variables,
|};
*/

var node/*: ConcreteUpdatableQuery*/ = (function(){
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
  "name": "readUpdatableQueryTest_user"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryTestUpdatableQuery",
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
              {
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
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/),
          {
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
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "id",
            "value": "4"
          }
        ],
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
        "args": [
          {
            "kind": "Literal",
            "name": "id",
            "value": "5"
          }
        ],
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
                    "selections": [
                      (v2/*: any*/)
                    ],
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
        "args": [
          {
            "kind": "Literal",
            "name": "id",
            "value": "6"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableQueryTest_node"
          }
        ],
        "storageKey": "node(id:\"6\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "UpdatableQuery"
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ad00b2de468d8a8877260a0cb5a0db06";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryTestUpdatableQuery$variables,
  readUpdatableQueryTestUpdatableQuery$data,
>*/);
