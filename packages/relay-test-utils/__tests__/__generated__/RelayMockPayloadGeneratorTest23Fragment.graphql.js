/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fbfb3fe4aa93e953cb6d156acd7600a3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest23Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest23Fragment$ref = RelayMockPayloadGeneratorTest23Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest23Fragment$data = {|
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest23Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest23Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest23Fragment = RelayMockPayloadGeneratorTest23Fragment$data;
export type RelayMockPayloadGeneratorTest23Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest23Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest23Fragment$fragmentType,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest23Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest23Fragment$fragmentType,
  RelayMockPayloadGeneratorTest23Fragment$data,
>*/);
