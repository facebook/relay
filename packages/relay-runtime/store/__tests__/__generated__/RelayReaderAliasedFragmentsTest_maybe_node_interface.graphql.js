/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cab1e0aee9c4450d72ac8db5eea15107>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTest_maybe_node_interface$data = {|
  +name: ?string,
  +$fragmentType: RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType,
|};
export type RelayReaderAliasedFragmentsTest_maybe_node_interface$key = {
  +$data?: RelayReaderAliasedFragmentsTest_maybe_node_interface$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTest_maybe_node_interface",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "MaybeNodeInterface",
  "abstractKey": "__isMaybeNodeInterface"
};

if (__DEV__) {
  (node/*: any*/).hash = "6becea16b048a31de893c600f9b92e64";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTest_maybe_node_interface$fragmentType,
  RelayReaderAliasedFragmentsTest_maybe_node_interface$data,
>*/);
