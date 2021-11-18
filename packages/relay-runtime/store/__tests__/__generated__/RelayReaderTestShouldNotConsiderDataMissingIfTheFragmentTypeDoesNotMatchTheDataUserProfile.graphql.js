/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1eaa0ada9e2d1532b1575a1daa465fd3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$ref = RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType,
|};
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile = RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$data;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$key = {
  +$data?: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$data,
  +$fragmentSpreads: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile",
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
  (node/*: any*/).hash = "73b916d460fd2db70f000c5eb3ba148a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType,
  RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$data,
>*/);
