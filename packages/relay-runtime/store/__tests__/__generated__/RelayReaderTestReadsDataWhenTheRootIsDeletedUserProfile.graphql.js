/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a7f4c2f0bf87de20dd4d46c70b4c4ea2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType: FragmentType;
export type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType,
|};
export type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$key = {
  +$data?: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$data,
  +$fragmentSpreads: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile",
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
  (node/*:: as any*/).hash = "0c8e161f9c5782db22155b040edaf569";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType,
  RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$data,
>*/);
