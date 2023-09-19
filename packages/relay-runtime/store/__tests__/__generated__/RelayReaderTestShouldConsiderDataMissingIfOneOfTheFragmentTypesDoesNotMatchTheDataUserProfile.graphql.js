/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f3e7344fed07ade6caaa34fbd7d8a8b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$fragmentType,
|};
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$key = {
  +$data?: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$data,
  +$fragmentSpreads: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile",
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
  (node/*: any*/).hash = "e7e60e8d515da99d84d264b712fb2b5f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$fragmentType,
  RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$data,
>*/);
