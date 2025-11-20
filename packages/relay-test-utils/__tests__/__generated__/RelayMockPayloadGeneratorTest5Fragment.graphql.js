/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f8ebdf82495a3596d695bd582491a44b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest4Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest4Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest5Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest5Fragment$data = {|
  +actor: ?({|
    +friends: ?{|
      +edges: ?ReadonlyArray<?{|
        +cursor: ?string,
        +node: ?{|
          +id: string,
          +$fragmentSpreads: RelayMockPayloadGeneratorTest4Fragment$fragmentType,
        |},
      |}>,
    |},
    +id: string,
    +myName: ?string,
    +myType: "User",
    +name: ?string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest4Fragment$fragmentType,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +myType: "%other",
  |}),
  +$fragmentType: RelayMockPayloadGeneratorTest5Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest5Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest5Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "RelayMockPayloadGeneratorTest4Fragment"
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "first"
    },
    {
      "kind": "RootArgument",
      "name": "skipUserInConnection"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": null,
        "direction": "forward",
        "path": [
          "actor",
          "friends"
        ]
      }
    ]
  },
  "name": "RelayMockPayloadGeneratorTest5Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": "myType",
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            {
              "alias": "myName",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": "friends",
              "args": null,
              "concreteType": "FriendsConnection",
              "kind": "LinkedField",
              "name": "__FriendsConnection_friends_connection",
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
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "User",
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        (v0/*: any*/),
                        {
                          "condition": "skipUserInConnection",
                          "kind": "Condition",
                          "passingValue": false,
                          "selections": [
                            (v1/*: any*/)
                          ]
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "__typename",
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "PageInfo",
                  "kind": "LinkedField",
                  "name": "pageInfo",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "endCursor",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "hasNextPage",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            (v1/*: any*/)
          ],
          "type": "User",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f00962ad9a873757b70472af4c68956a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest5Fragment$fragmentType,
  RelayMockPayloadGeneratorTest5Fragment$data,
>*/);
