/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<10d99aad572cf708781d6a2425fc893e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type RelayMockPayloadGeneratorTest_fragment61$normalization = {|
  +id: string,
  +name?: ?string,
|};

*/

var node/*: NormalizationSplitOperation*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "RelayMockPayloadGeneratorTest_fragment61$cond"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayMockPayloadGeneratorTest_fragment61$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "RelayMockPayloadGeneratorTest_fragment61$cond",
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
  (node/*: any*/).hash = "25e64d959ac400af76cce1c64d022f38";
}

module.exports = node;
