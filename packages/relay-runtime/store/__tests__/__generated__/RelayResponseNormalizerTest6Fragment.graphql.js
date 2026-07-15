/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<334d7163784c6d33d3a7c9d47fdfcc1e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest6Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest6Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RelayResponseNormalizerTest6Fragment$fragmentType,
};
export type RelayResponseNormalizerTest6Fragment$key = {
  readonly $data?: RelayResponseNormalizerTest6Fragment$data,
  readonly $fragmentSpreads: RelayResponseNormalizerTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest6Fragment",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "b36b98e9fcb8f74e81947212f0853117";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest6Fragment$fragmentType,
  RelayResponseNormalizerTest6Fragment$data,
>*/);
