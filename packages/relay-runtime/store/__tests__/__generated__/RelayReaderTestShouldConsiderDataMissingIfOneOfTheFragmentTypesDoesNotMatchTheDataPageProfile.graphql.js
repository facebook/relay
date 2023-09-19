/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0b639a358d9b5d7a5bbaa6f4bfecbd4e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$data = {|
  +id: string,
  +$fragmentType: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$fragmentType,
|};
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$key = {
  +$data?: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$data,
  +$fragmentSpreads: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6223c93046fc3ac12f677eeb433562ce";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$fragmentType,
  RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$data,
>*/);
