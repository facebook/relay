/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<69feae87421a45880fce64e1178b765e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest26Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest25Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest25Fragment$ref = RelayMockPayloadGeneratorTest25Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest25Fragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest26Fragment$fragmentType,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest25Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest25Fragment = RelayMockPayloadGeneratorTest25Fragment$data;
export type RelayMockPayloadGeneratorTest25Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest25Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest25Fragment$fragmentType,
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
  (node/*: any*/).hash = "afa051cf8db4f22783a64b71416475f3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest25Fragment$fragmentType,
  RelayMockPayloadGeneratorTest25Fragment$data,
>*/);
