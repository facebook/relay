/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3fc1efecb338413baf5515e1c4071d79>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest17Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest17Fragment$data = {
  readonly id: string,
  readonly pageName: ?string,
  readonly $fragmentType: RelayMockPayloadGeneratorTest17Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest17Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest17Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest17Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "7a95e906406be378e4662b8cb3362787";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest17Fragment$fragmentType,
  RelayMockPayloadGeneratorTest17Fragment$data,
>*/);
