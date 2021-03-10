/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0150056f2031eeadde7eb81869005b01>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest26Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest25Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest25Fragment$fragmentType: RelayMockPayloadGeneratorTest25Fragment$ref;
export type RelayMockPayloadGeneratorTest25Fragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +$fragmentRefs: RelayMockPayloadGeneratorTest26Fragment$ref,
  |},
  +$refType: RelayMockPayloadGeneratorTest25Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest25Fragment$data = RelayMockPayloadGeneratorTest25Fragment;
export type RelayMockPayloadGeneratorTest25Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest25Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest25Fragment$ref,
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

module.exports = node;
