/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dca41970ad57afd7ba4d77ed3bb4fa19>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest18Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest19Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest19Fragment$fragmentType: RelayMockPayloadGeneratorTest19Fragment$ref;
export type RelayMockPayloadGeneratorTest19Fragment = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: RelayMockPayloadGeneratorTest18Fragment$ref,
  +$refType: RelayMockPayloadGeneratorTest19Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest19Fragment$data = RelayMockPayloadGeneratorTest19Fragment;
export type RelayMockPayloadGeneratorTest19Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest19Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest19Fragment$ref,
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

module.exports = node;
