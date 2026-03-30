/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7465b8442ff429b0cdae395a9a2a603b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline$cond"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline$normalization",
  "selections": [
    {
      "condition": "RelayModernEnvironmentNoInlineTest_nestedNoInline$cond",
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
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "03fe30da355c92ff890c6c4988eb3ec3";
}

module.exports = node;
