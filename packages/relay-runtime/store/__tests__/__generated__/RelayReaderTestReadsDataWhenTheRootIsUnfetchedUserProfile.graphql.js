/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6384e1afc2810f72551a24ba04c3b59e>>
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
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderTestReadsDataWhenTheRootIsUnfetchedUserProfile$fragmentType,
|};
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
