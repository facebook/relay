/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6d1d2f27fbc77c5ca62f829e3fe8af61>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture$fragmentType } from "./RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType: FragmentType;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$data = {|
  +id: string,
  +name: ?string,
  +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture$fragmentType,
  +$fragmentType: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType,
|};
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
