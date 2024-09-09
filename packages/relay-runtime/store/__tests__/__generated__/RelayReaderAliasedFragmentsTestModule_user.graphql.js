/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b02fc07802acfddfb484bfa8f571a701>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestModule_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestModule_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestModule_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestModule_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestModule_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestModule_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestModule_user",
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
  (node/*: any*/).hash = "b8698ea6297564c20e38f429f0f4f491";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestModule_user$fragmentType,
  RelayReaderAliasedFragmentsTestModule_user$data,
>*/);
