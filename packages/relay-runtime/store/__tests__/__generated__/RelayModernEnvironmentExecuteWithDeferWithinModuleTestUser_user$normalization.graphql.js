/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b825b95f621a35736070367bc44fc06c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization",
  "selections": [
    {
      "if": null,
      "kind": "Defer",
      "label": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
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
  (node/*: any*/).hash = "04d25ce78bcd07804cf0d4b5d3114cf0";
}

module.exports = node;
