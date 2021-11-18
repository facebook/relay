/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<343eb8b15c596ab2aeccd2e9c65aacc8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerFlowtest_viewer$fragmentType: FragmentType;
export type ReactRelayRefetchContainerFlowtest_viewer$ref = ReactRelayRefetchContainerFlowtest_viewer$fragmentType;
export type ReactRelayRefetchContainerFlowtest_viewer$data = {|
  +account_user: ?{|
    +friends: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +__typename: string,
        |},
      |}>,
    |},
  |},
  +$fragmentType: ReactRelayRefetchContainerFlowtest_viewer$fragmentType,
|};
export type ReactRelayRefetchContainerFlowtest_viewer = ReactRelayRefetchContainerFlowtest_viewer$data;
export type ReactRelayRefetchContainerFlowtest_viewer$key = {
  +$data?: ReactRelayRefetchContainerFlowtest_viewer$data,
  +$fragmentSpreads: ReactRelayRefetchContainerFlowtest_viewer$fragmentType,
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
  "name": "ReactRelayRefetchContainerFlowtest_viewer",
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
          "name": "__ReactRelayRefetchContainerFlowtest_viewer__friends_connection",
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
  (node/*: any*/).hash = "cf098b4248d8ddfacfc0d356838697bb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayRefetchContainerFlowtest_viewer$fragmentType,
  ReactRelayRefetchContainerFlowtest_viewer$data,
>*/);
