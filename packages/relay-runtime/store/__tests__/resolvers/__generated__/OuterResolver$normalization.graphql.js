/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bd75bb6036c33111786668b08809f0a2>>
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
  "name": "OuterResolver$normalization",
  "selections": [
    {
      "name": "inner",
      "args": null,
      "kind": "RelayLiveResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../InnerResolver').inner,
        "rootFragment": require('./InnerResolver$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "95e62e0f7574f311e930c3bad24ff822";
}

module.exports = node;
