/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<32bf84ca21b45455db1071a8bebeb765>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType: FragmentType;
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$ref = RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType;
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType,
|};
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile = RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data;
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$key = {
  +$data?: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data,
  +$fragmentSpreads: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile",
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
  (node/*: any*/).hash = "8a7ed72952ef5e28d836b287932a29f7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType,
  RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data,
>*/);
