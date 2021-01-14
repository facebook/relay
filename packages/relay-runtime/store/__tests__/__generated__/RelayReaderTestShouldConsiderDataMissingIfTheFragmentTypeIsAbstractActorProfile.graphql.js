/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<724aa6959f25b4b6ef1eb7a184a75690>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$fragmentType: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$ref;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile = {|
  +name: ?string,
  +$refType: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$ref,
|};
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$data = RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile;
export type RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$key = {
  +$data?: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$data,
  +$fragmentRefs: RelayReaderTestShouldConsiderDataMissingIfTheFragmentTypeIsAbstractActorProfile$ref,
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

module.exports = node;
