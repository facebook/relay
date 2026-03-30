/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<013897dddb73a0b956d85473e5e32d4e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$fragmentType: FragmentType;
export type ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$data = {|
  +friends: ?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +name: ?string,
      |},
    |}>,
  |},
  +id: string,
  +name: ?string,
  +$fragmentType: ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$key = {
  +$data?: ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$data,
  +$fragmentSpreads: ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "count"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": null,
        "direction": "forward",
        "path": [
          "friends"
        ]
      }
    ]
  },
  "name": "ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    (v0/*:: as any*/),
    {
      "alias": "friends",
      "args": null,
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment_friends_connection",
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
                (v0/*:: as any*/),
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
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "6acef6ac357c40134d0599c7879d1a48";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$fragmentType,
  ReactRelayPaginationContainerReactDoubleEffectsTestUserFragment$data,
>*/);
