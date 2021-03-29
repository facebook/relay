/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4ffab519932fd1a1d5b48bbdc12a9c76>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "249818d80bc3fb0e1c6d70a90c1a8b6f";
}

module.exports = node;
