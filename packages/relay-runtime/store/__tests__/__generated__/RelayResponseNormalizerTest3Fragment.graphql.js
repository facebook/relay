/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e45536f7d2da995e27f980c3ec72ae3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest3Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest3Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RelayResponseNormalizerTest3Fragment$fragmentType,
};
export type RelayResponseNormalizerTest3Fragment$key = {
  readonly $data?: RelayResponseNormalizerTest3Fragment$data,
  readonly $fragmentSpreads: RelayResponseNormalizerTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest3Fragment",
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
  (node/*:: as any*/).hash = "561328cf17808941f0e564b834c019dc";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest3Fragment$fragmentType,
  RelayResponseNormalizerTest3Fragment$data,
>*/);
