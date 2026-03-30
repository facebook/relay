/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1ded97fc7838de02c017d6ec375714cd>>
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
  (node/*:: as any*/).hash = "128d4575c05488220a7b8d80e4fcd30e";
}

module.exports = node;
