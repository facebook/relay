/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<55b5c9d7dca549678aa9f35e8cb1cad5>>
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
  "metadata": {
    "hasServerField": true
  },
  "name": "UserConstantDependentResolver$normalization",
  "selections": [
    {
      "name": "constant",
      "args": null,
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../UserConstantResolver').constant,
        "rootFragment": require('./UserConstantResolver$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "24ebf834d1a139bc177fc287cdf0dfd2";
}

module.exports = node;
