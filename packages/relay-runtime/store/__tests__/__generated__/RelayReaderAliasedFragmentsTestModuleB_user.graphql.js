/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3933000781bd09e05896339d74d20028>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestModuleB_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestModuleB_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestModuleB_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestModuleB_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestModuleB_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleB_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestModuleB_user",
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
  (node/*:: as any*/).hash = "81e045c46e00a4b0594cd79e672bdc3a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderAliasedFragmentsTestModuleB_user$fragmentType,
  RelayReaderAliasedFragmentsTestModuleB_user$data,
>*/);
