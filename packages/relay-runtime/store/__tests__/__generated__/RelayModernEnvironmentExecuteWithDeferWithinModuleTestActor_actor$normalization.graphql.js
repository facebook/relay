/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7a28f9ec3e5080986bccc5f3bb32d437>>
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
  "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization",
  "selections": [
    {
      "args": null,
      "fragment": require('./RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql'),
      "kind": "FragmentSpread"
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "128d4575c05488220a7b8d80e4fcd30e";
}

module.exports = node;
