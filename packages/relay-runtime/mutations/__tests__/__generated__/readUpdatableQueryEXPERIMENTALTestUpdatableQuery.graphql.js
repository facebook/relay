/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f19068849766f9cb3e803d00b09c8597>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
type readUpdatableQueryEXPERIMENTALTest_node$fragmentType = any;
type readUpdatableQueryEXPERIMENTALTest_user$fragmentType = any;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables = {||};
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
        +__typename: "User",
        +__id: string,
        +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
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
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
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
      +__typename: "User",
      +__id: string,
      +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
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
    +__isreadUpdatableQueryEXPERIMENTALTest_node: string,
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_node$fragmentType,
    ...
  }): void,
|};
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery = {|
  response: readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data,
  variables: readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables,
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
  "name": "readUpdatableQueryEXPERIMENTALTest_user"
};
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
            "name": "readUpdatableQueryEXPERIMENTALTest_node"
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
  (node/*: any*/).hash = "91a7122121c1d4d4b99ee4b8155b4fbd";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables,
  readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data,
>*/);
