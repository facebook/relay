/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7434594170c25bc3887c8acff299a61e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getAllRootVariablesTest4Fragment2$fragmentType: FragmentType;
export type getAllRootVariablesTest4Fragment2$ref = getAllRootVariablesTest4Fragment2$fragmentType;
export type getAllRootVariablesTest4Fragment2$data = {|
  +name?: ?string,
  +$fragmentType: getAllRootVariablesTest4Fragment2$fragmentType,
|};
export type getAllRootVariablesTest4Fragment2 = getAllRootVariablesTest4Fragment2$data;
export type getAllRootVariablesTest4Fragment2$key = {
  +$data?: getAllRootVariablesTest4Fragment2$data,
  +$fragmentSpreads: getAllRootVariablesTest4Fragment2$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest4Fragment2__includeName"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getAllRootVariablesTest4Fragment2",
  "selections": [
    {
      "condition": "__getAllRootVariablesTest4Fragment2__includeName",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d0bd9984a8b9b61c3ad2f5abc82714b1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getAllRootVariablesTest4Fragment2$fragmentType,
  getAllRootVariablesTest4Fragment2$data,
>*/);
