/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a7cec5db79636b4ba0984292189ece72>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$ref;
export type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile = {|
  +name: ?string,
  +$refType: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$ref,
|};
export type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$data = RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile;
export type RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$key = {
  +$data?: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$data,
  +$fragmentRefs: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$ref,
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
  (node/*: any*/).hash = "0c8e161f9c5782db22155b040edaf569";
}

module.exports = node;
