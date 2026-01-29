/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6eb62a5c4057af2db8b775c4fa1a42c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestModuleA_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestModuleA_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestModuleA_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestModuleA_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestModuleA_user",
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
  (node/*: any*/).hash = "2208c38dc786830dd9c31b09e48dafec";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
  RelayReaderAliasedFragmentsTestModuleA_user$data,
>*/);
