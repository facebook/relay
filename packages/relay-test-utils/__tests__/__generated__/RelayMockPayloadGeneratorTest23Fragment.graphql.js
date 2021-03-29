/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<39dcc62b778b28a6c969cfcc96fad2fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest23Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest23Fragment$fragmentType: RelayMockPayloadGeneratorTest23Fragment$ref;
export type RelayMockPayloadGeneratorTest23Fragment = {|
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest23Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest23Fragment$data = RelayMockPayloadGeneratorTest23Fragment;
export type RelayMockPayloadGeneratorTest23Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest23Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest23Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest23Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "106e033849ffa4b15df827c86bc5a95c";
}

module.exports = node;
