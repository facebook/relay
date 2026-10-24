/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3483e8efa9a0e5316be4fa6b318a895f>>
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
  "name": "ExecTimeS2CResolvers_ClientRootOuterFragment$normalization",
  "selections": [
    {
      "name": "exec_time_s2c_client_root",
      "args": null,
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../ExecTimeS2CResolvers').exec_time_s2c_client_root,
        "rootFragment": require('./ExecTimeS2CResolvers_ClientRootFragment$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5b454da914fc847c4b482eb14a7b3ca4";
}

module.exports = node;
