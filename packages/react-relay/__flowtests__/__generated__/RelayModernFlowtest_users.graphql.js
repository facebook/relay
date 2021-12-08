/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d2e1d6f0352e992d909d6217160aab1e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFlowtest_users$fragmentType: FragmentType;
export type RelayModernFlowtest_users$ref = RelayModernFlowtest_users$fragmentType;
export type RelayModernFlowtest_users$data = $ReadOnlyArray<{|
  +name: ?string,
  +$fragmentType: RelayModernFlowtest_users$fragmentType,
|}>;
export type RelayModernFlowtest_users = RelayModernFlowtest_users$data;
export type RelayModernFlowtest_users$key = $ReadOnlyArray<{
  +$data?: RelayModernFlowtest_users$data,
  +$fragmentSpreads: RelayModernFlowtest_users$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RelayModernFlowtest_users",
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
  (node/*: any*/).hash = "4e6f0e70d48ec58651c17e3150c63d05";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFlowtest_users$fragmentType,
  RelayModernFlowtest_users$data,
>*/);
