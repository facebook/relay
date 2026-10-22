/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d58991971ceba216743f4da7e9681293>>
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
  "name": "TodoTextResolverFragment$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "name": "self",
          "args": null,
          "kind": "RelayLiveResolver",
          "storageKey": null,
          "isOutputType": true,
          "resolverInfo": {
            "resolverFunction": require('../TodoSelfResolver').self,
            "rootFragment": require('./TodoSelfResolverFragment$normalization.graphql')
          }
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "825ea3b21e9b9c4edf4633dae8276c4f";
}

module.exports = node;
