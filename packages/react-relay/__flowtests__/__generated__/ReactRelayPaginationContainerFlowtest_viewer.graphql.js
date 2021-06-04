/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<327dc7ccd50822a21f8284e9c50b2bbc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerFlowtest_viewer$ref: FragmentReference;
declare export opaque type ReactRelayPaginationContainerFlowtest_viewer$fragmentType: ReactRelayPaginationContainerFlowtest_viewer$ref;
export type ReactRelayPaginationContainerFlowtest_viewer = {|
  +account_user: ?{|
    +friends: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +__typename: string,
        |},
      |}>,
    |},
  |},
  +$refType: ReactRelayPaginationContainerFlowtest_viewer$ref,
|};
export type ReactRelayPaginationContainerFlowtest_viewer$data = ReactRelayPaginationContainerFlowtest_viewer;
export type ReactRelayPaginationContainerFlowtest_viewer$key = {
  +$data?: ReactRelayPaginationContainerFlowtest_viewer$data,
  +$fragmentRefs: ReactRelayPaginationContainerFlowtest_viewer$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "count"
    },
    {
      "kind": "RootArgument",
      "name": "cursor"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": [
          "account_user",
          "friends"
        ]
      }
    ]
  },
  "name": "ReactRelayPaginationContainerFlowtest_viewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "account_user",
      "plural": false,
      "selections": [
        {
          "alias": "friends",
          "args": null,
          "concreteType": "FriendsConnection",
          "kind": "LinkedField",
          "name": "__ReactRelayPaginationContainerFlowtest_viewer__friends_connection",
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0db8995009ebfee6165f6bbaa465d13f";
}

module.exports = node;
