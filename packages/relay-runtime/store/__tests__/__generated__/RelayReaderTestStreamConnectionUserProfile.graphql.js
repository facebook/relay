/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<da998be2b8ae5fb22b4661cb8cea16ec>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestStreamConnectionUserProfile$fragmentType: FragmentType;
export type RelayReaderTestStreamConnectionUserProfile$ref = RelayReaderTestStreamConnectionUserProfile$fragmentType;
export type RelayReaderTestStreamConnectionUserProfile$data = {|
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +name: ?string,
      |},
    |}>,
  |},
  +$refType: RelayReaderTestStreamConnectionUserProfile$fragmentType,
  +$fragmentType: RelayReaderTestStreamConnectionUserProfile$fragmentType,
|};
export type RelayReaderTestStreamConnectionUserProfile = RelayReaderTestStreamConnectionUserProfile$data;
export type RelayReaderTestStreamConnectionUserProfile$key = {
  +$data?: RelayReaderTestStreamConnectionUserProfile$data,
  +$fragmentRefs: RelayReaderTestStreamConnectionUserProfile$fragmentType,
  +$fragmentSpreads: RelayReaderTestStreamConnectionUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "forward",
        "path": [
          "friends"
        ],
        "stream": true
      }
    ]
  },
  "name": "RelayReaderTestStreamConnectionUserProfile",
  "selections": [
    {
      "alias": "friends",
      "args": null,
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__UserProfile_friends_connection",
      "plural": false,
      "selections": [
        {
          "kind": "Stream",
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
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "name",
                      "storageKey": null
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
                },
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
          ]
        },
        {
          "kind": "Defer",
          "selections": [
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
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "a9c46314fbe83e2527090da1e7208239";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestStreamConnectionUserProfile$fragmentType,
  RelayReaderTestStreamConnectionUserProfile$data,
>*/);
