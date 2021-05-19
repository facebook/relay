/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ff6d43957ff0f4c7c4c682d3b520e7cf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization = any;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization = {|
  ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization,
|};

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
