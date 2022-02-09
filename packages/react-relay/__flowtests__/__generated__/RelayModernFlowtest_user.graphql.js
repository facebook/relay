/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a7ba31d9d2381b0c8b700175be271b75>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFlowtest_user$fragmentType: FragmentType;
export type RelayModernFlowtest_user$data = {|
  +name: ?string,
  +$fragmentType: RelayModernFlowtest_user$fragmentType,
|};
export type RelayModernFlowtest_user$key = {
  +$data?: RelayModernFlowtest_user$data,
  +$fragmentSpreads: RelayModernFlowtest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFlowtest_user",
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
  (node/*: any*/).hash = "18a730295ff54e88446f4f000f5fef7e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFlowtest_user$fragmentType,
  RelayModernFlowtest_user$data,
>*/);
