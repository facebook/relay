/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1378686a27c315801f08a59925d0a4c4>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$data = {
  readonly name?: ?string,
  readonly $fragmentType: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
};
export type RelayModernEnvironmentNoInlineTest_nestedNoInline$key = {
  readonly $data?: RelayModernEnvironmentNoInlineTest_nestedNoInline$data,
  readonly $fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
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
  (node/*:: as any*/).hash = "03fe30da355c92ff890c6c4988eb3ec3";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  RelayModernEnvironmentNoInlineTest_nestedNoInline$data,
>*/);
