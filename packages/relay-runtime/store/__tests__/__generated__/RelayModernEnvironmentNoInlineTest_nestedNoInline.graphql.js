/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<03fe02fa9a632045f125acd3fffd2dae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$ref = RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType;
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$data = {|
  +name?: ?string,
  +$fragmentType: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTest_nestedNoInline = RelayModernEnvironmentNoInlineTest_nestedNoInline$data;
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_nestedNoInline$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline",
  "selections": [
    {
      "condition": "cond",
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
  (node/*: any*/).hash = "03fe30da355c92ff890c6c4988eb3ec3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  RelayModernEnvironmentNoInlineTest_nestedNoInline$data,
>*/);
