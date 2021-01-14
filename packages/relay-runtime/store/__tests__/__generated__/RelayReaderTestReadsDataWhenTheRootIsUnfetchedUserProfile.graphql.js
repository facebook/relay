/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dfa707b2788483142b720e2cb3e0c5d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$ref: FragmentReference;
declare export opaque type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$ref;
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile = {|
  +name: ?string,
  +$refType: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$ref,
|};
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data = RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile;
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$key = {
  +$data?: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data,
  +$fragmentRefs: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$ref,
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

module.exports = node;
