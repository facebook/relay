/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8cfc221caf8236a8279a0b578a4c03a3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernFlowtest_user$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFlowtest_notref$fragmentType: FragmentType;
export type RelayModernFlowtest_notref$ref = RelayModernFlowtest_notref$fragmentType;
export type RelayModernFlowtest_notref$data = {|
  +id: string,
  +$fragmentSpreads: RelayModernFlowtest_user$fragmentType,
  +$fragmentType: RelayModernFlowtest_notref$fragmentType,
|};
export type RelayModernFlowtest_notref = RelayModernFlowtest_notref$data;
export type RelayModernFlowtest_notref$key = {
  +$data?: RelayModernFlowtest_notref$data,
  +$fragmentSpreads: RelayModernFlowtest_notref$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFlowtest_notref",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernFlowtest_user"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d61c43d07b2fe8f623c9b84fcdf70ac8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFlowtest_notref$fragmentType,
  RelayModernFlowtest_notref$data,
>*/);
