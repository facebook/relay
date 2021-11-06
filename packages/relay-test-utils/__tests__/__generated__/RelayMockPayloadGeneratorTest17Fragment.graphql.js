/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7055e7b3a6037a8c22099f4bd745a87a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest17Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest17Fragment$fragmentType: RelayMockPayloadGeneratorTest17Fragment$ref;
export type RelayMockPayloadGeneratorTest17Fragment = {|
  +id: string,
  +pageName: ?string,
  +$refType: RelayMockPayloadGeneratorTest17Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest17Fragment$data = RelayMockPayloadGeneratorTest17Fragment;
export type RelayMockPayloadGeneratorTest17Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest17Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest17Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest17Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": "pageName",
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7a95e906406be378e4662b8cb3362787";
}

module.exports = node;
