/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ce2e3765a16b9c10c73ea578486cfc00>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType,
|};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$key = {
  +$data?: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$data,
  +$fragmentSpreads: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "f4702c471dc08722c7cdd23f5a9b3819";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType,
  RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$data,
>*/);
