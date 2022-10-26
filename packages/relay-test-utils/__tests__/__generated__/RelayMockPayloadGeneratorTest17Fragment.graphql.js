/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b241dc14481d59e088c1b7a257fbbf37>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest17Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest17Fragment$data = {|
  +id: string,
  +pageName: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest17Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest17Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest17Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest17Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest17Fragment$fragmentType,
  RelayMockPayloadGeneratorTest17Fragment$data,
>*/);
