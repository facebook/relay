/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47e712b1dfa94b1403d184d8bbbbaac6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestModuleMatches_user$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestModuleMatches_user$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestModuleMatches_user$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestModuleMatches_user$key = {
  +$data?: RelayReaderAliasedFragmentsTestModuleMatches_user$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleMatches_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestModuleMatches_user",
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
  (node/*: any*/).hash = "76d147f25b724c6c0368c453a26e4861";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestModuleMatches_user$fragmentType,
  RelayReaderAliasedFragmentsTestModuleMatches_user$data,
>*/);
