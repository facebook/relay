/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8934b866941f002efc6764e5cefbdfe2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type RelayMockPayloadGeneratorTest_fragment59$normalization = {|
  +id: string,
  +name?: ?string,
|};

*/

var node/*: NormalizationSplitOperation*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "RelayMockPayloadGeneratorTest_fragment59$cond"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayMockPayloadGeneratorTest_fragment59$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "RelayMockPayloadGeneratorTest_fragment59$cond",
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
  (node/*: any*/).hash = "efeafd8b46bc5e1d5e9deb6e69637ccc";
}

module.exports = node;
