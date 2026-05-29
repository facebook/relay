/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a83a80d7d5cdff228e05317e0d2a2730>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadScalarProfile$fragmentType: FragmentType;
export type RelayReaderTestReadScalarProfile$data = {
  readonly id: string,
  readonly $fragmentType: RelayReaderTestReadScalarProfile$fragmentType,
};
export type RelayReaderTestReadScalarProfile$key = {
  readonly $data?: RelayReaderTestReadScalarProfile$data,
  readonly $fragmentSpreads: RelayReaderTestReadScalarProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestReadScalarProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "568b33ad407adb1c329bfcaf3c152667";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestReadScalarProfile$fragmentType,
  RelayReaderTestReadScalarProfile$data,
>*/);
