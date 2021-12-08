/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2d73f66797fb376dd27de9625c67deac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerFlowtest_viewer$fragmentType: FragmentType;
export type ReactRelayPaginationContainerFlowtest_viewer$ref = ReactRelayPaginationContainerFlowtest_viewer$fragmentType;
export type ReactRelayPaginationContainerFlowtest_viewer$data = {|
  +account_user: ?{|
    +friends: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +__typename: string,
        |},
      |}>,
    |},
  |},
  +$fragmentType: ReactRelayPaginationContainerFlowtest_viewer$fragmentType,
|};
export type ReactRelayPaginationContainerFlowtest_viewer = ReactRelayPaginationContainerFlowtest_viewer$data;
export type ReactRelayPaginationContainerFlowtest_viewer$key = {
  +$data?: ReactRelayPaginationContainerFlowtest_viewer$data,
  +$fragmentSpreads: ReactRelayPaginationContainerFlowtest_viewer$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayPaginationContainerFlowtest_viewer$fragmentType,
  ReactRelayPaginationContainerFlowtest_viewer$data,
>*/);
