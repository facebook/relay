/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<06c7a3c9bd9fa0c2283c7a7b19a41724>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest21Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest21Fragment$fragmentType: RelayMockPayloadGeneratorTest21Fragment$ref;
export type RelayMockPayloadGeneratorTest21Fragment = {|
  +birthdate: ?{|
    +month: ?number,
  |},
  +$refType: RelayMockPayloadGeneratorTest21Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest21Fragment$data = RelayMockPayloadGeneratorTest21Fragment;
export type RelayMockPayloadGeneratorTest21Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest21Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest21Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest21Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Date",
      "kind": "LinkedField",
      "name": "birthdate",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "month",
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
  (node/*: any*/).hash = "093556c04c6e7321996c73f5781d15ce";
}

module.exports = node;
