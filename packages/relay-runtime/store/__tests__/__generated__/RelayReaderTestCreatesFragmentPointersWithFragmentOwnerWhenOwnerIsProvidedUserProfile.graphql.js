/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c9fb44379ea807734710c41ba00c467>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$ref = RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$data = {|
  +id: string,
  +name: ?string,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture$fragmentType,
  +$fragmentType: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType,
|};
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile = RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$data;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$key = {
  +$data?: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$data,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile",
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8151f8d85b45ded9ad7374d55f917448";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType,
  RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$data,
>*/);
