/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a28b5cfb7bf050f34e19e02e1113d98>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestModuleA_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestModuleA_user$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
};
export type RelayReaderAliasedFragmentsTestModuleA_user$key = {
  readonly $data?: RelayReaderAliasedFragmentsTestModuleA_user$data,
  readonly $fragmentSpreads: RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
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
  (node/*:: as any*/).hash = "2208c38dc786830dd9c31b09e48dafec";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
  RelayReaderAliasedFragmentsTestModuleA_user$data,
>*/);
