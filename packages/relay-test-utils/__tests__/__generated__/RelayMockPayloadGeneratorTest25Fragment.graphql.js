/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e2da07b5a990b674bfb6c0c1610751a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest26Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest26Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest25Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest25Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly profile_picture: ?{
    readonly $fragmentSpreads: RelayMockPayloadGeneratorTest26Fragment$fragmentType,
  },
  readonly $fragmentType: RelayMockPayloadGeneratorTest25Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest25Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest25Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest25Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest25Fragment",
  "selections": [
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
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayMockPayloadGeneratorTest26Fragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "afa051cf8db4f22783a64b71416475f3";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest25Fragment$fragmentType,
  RelayMockPayloadGeneratorTest25Fragment$data,
>*/);
