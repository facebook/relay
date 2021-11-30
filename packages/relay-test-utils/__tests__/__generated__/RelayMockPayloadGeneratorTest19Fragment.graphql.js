/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f8ff7363e5ee11e0ed94c683a595514f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest18Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest19Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest19Fragment$ref = RelayMockPayloadGeneratorTest19Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest19Fragment$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: RelayMockPayloadGeneratorTest18Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest19Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest19Fragment = RelayMockPayloadGeneratorTest19Fragment$data;
export type RelayMockPayloadGeneratorTest19Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest19Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest19Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest19Fragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest18Fragment"
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
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
  (node/*: any*/).hash = "77f290b7279de42a5a8a38ee70702b0d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest19Fragment$fragmentType,
  RelayMockPayloadGeneratorTest19Fragment$data,
>*/);
