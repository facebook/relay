/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9dec55cb58dd32a51db2ef23448db25e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTest_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTest_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTest_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTest_user$key = {
  +$data?: RelayReaderAliasedFragmentsTest_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTest_user",
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
  (node/*:: as any*/).hash = "b6f8fe7f5d7c02549330b6f4097da7db";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderAliasedFragmentsTest_user$fragmentType,
  RelayReaderAliasedFragmentsTest_user$data,
>*/);
