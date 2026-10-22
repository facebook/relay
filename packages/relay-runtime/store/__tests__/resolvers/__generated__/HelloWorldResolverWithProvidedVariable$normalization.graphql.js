/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f6881de7e7ccd5a9ed46098e203031bd>>
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
  "name": "HelloWorldResolverWithProvidedVariable$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "name": "hello",
          "args": [
            {
              "kind": "Variable",
              "name": "world",
              "variableName": "__relay_internal__pv__HelloWorldProviderrelayprovider"
            }
          ],
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true,
          "resolverInfo": {
            "resolverFunction": require('../HelloWorldResolver').hello,
            "rootFragment": null
          }
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "9f94df55099df09e6d33779b83f732fc";
}

module.exports = node;
