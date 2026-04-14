/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8909561248e02204fdc053e1842c6401>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderClientEdgesTestFragmentOnUser$fragmentType: FragmentType;
export type RelayReaderClientEdgesTestFragmentOnUser$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderClientEdgesTestFragmentOnUser$fragmentType,
|};
export type RelayReaderClientEdgesTestFragmentOnUser$key = {
  +$data?: RelayReaderClientEdgesTestFragmentOnUser$data,
  +$fragmentSpreads: RelayReaderClientEdgesTestFragmentOnUser$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderClientEdgesTestFragmentOnUser",
  "selections": [
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
  (node/*:: as any*/).hash = "980b6113f0b816bda1638212efe32b87";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderClientEdgesTestFragmentOnUser$fragmentType,
  RelayReaderClientEdgesTestFragmentOnUser$data,
>*/);
