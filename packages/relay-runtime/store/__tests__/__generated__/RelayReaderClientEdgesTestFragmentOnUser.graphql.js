/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<11ec7548a4cf61f70192bdc7a4918ebc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
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
  (node/*: any*/).hash = "980b6113f0b816bda1638212efe32b87";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderClientEdgesTestFragmentOnUser$fragmentType,
  RelayReaderClientEdgesTestFragmentOnUser$data,
>*/);
