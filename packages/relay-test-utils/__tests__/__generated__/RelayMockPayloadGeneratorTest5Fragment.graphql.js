/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cb067fad8d24a8febecfef955100542b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest4Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest5Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest5Fragment$fragmentType: RelayMockPayloadGeneratorTest5Fragment$ref;
export type RelayMockPayloadGeneratorTest5Fragment = {|
  +actor: ?({|
    +id: string,
    +myType: "User",
    +myName: ?string,
    +name: ?string,
    +friends: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +cursor: ?string,
        +node: ?{|
          +id: string,
          +$fragmentRefs: RelayMockPayloadGeneratorTest4Fragment$ref,
        |},
      |}>,
    |},
    +$fragmentRefs: RelayMockPayloadGeneratorTest4Fragment$ref,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +myType: "%other",
  |}),
  +$refType: RelayMockPayloadGeneratorTest5Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest5Fragment$data = RelayMockPayloadGeneratorTest5Fragment;
export type RelayMockPayloadGeneratorTest5Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest5Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest5Fragment$ref,
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
  (node/*: any*/).hash = "0caeda7ac9d7c75061766462726bf298";
}

module.exports = node;
