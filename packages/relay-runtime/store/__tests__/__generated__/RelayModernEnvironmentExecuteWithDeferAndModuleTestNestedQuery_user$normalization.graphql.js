/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f7681aaedb0b2a22b1fb3e6046d21b94>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "if": null,
      "kind": "Defer",
      "label": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "if": null,
          "kind": "Defer",
          "label": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lastName",
              "storageKey": null
            }
          ]
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "e6803e7a0a81e2b0acd328649b47099a";
}

module.exports = node;
