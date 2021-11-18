/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<65ae8a77c9e68706a98d67685a62dff6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType: FragmentType;
export type ReactRelayPaginationContainerTestNoConnectionUserFragment$ref = ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType;
export type ReactRelayPaginationContainerTestNoConnectionUserFragment$data = {|
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
    +pageInfo: ?{|
      +endCursor: ?string,
      +hasNextPage: ?boolean,
    |},
  |},
  +$fragmentType: ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType,
|};
export type ReactRelayPaginationContainerTestNoConnectionUserFragment = ReactRelayPaginationContainerTestNoConnectionUserFragment$data;
export type ReactRelayPaginationContainerTestNoConnectionUserFragment$key = {
  +$data?: ReactRelayPaginationContainerTestNoConnectionUserFragment$data,
  +$fragmentSpreads: ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "after"
    },
    {
      "kind": "RootArgument",
      "name": "count"
    },
    {
      "kind": "RootArgument",
      "name": "orderby"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayPaginationContainerTestNoConnectionUserFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "after",
          "variableName": "after"
        },
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "count"
        },
        {
          "kind": "Variable",
          "name": "orderby",
          "variableName": "orderby"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
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
                  "name": "id",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "eb45ef2f80d883efa532e1585f97b9f6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayPaginationContainerTestNoConnectionUserFragment$fragmentType,
  ReactRelayPaginationContainerTestNoConnectionUserFragment$data,
>*/);
