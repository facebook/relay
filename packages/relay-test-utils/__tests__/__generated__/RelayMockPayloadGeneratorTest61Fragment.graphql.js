/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<919b6c7abf5d1fd5a9df7e87a6db8007>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest61SubFragment$fragmentType } from "./RelayMockPayloadGeneratorTest61SubFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest61Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest61Fragment$data = {|
  +friends: ?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +$fragmentSpreads: RelayMockPayloadGeneratorTest61SubFragment$fragmentType,
      |},
    |}>,
  |},
  +id: string,
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest61Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest61Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest61Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest61Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest61Fragment",
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
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
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
                  "kind": "Defer",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "RelayMockPayloadGeneratorTest61SubFragment"
                    }
                  ]
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "853420f56943a6c9654b9c942463c857";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest61Fragment$fragmentType,
  RelayMockPayloadGeneratorTest61Fragment$data,
>*/);
