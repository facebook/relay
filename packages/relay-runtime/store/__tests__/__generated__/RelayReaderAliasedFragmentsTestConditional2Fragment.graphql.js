/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5d5b904f8dd5ea05c5da736e5c9344eb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTestConditional2Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType,
|};
export type RelayReaderAliasedFragmentsTestConditional2Fragment$key = {
  +$data?: RelayReaderAliasedFragmentsTestConditional2Fragment$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTestConditional2Fragment",
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
  (node/*: any*/).hash = "da47c7d96012f84b35aa45d5fb33b715";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTestConditional2Fragment$fragmentType,
  RelayReaderAliasedFragmentsTestConditional2Fragment$data,
>*/);
