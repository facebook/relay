/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d4f9dfb76bf105ed120794d3a97d9c90>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$fragmentType: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$ref;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$data = RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment",
  "selections": [
    {
      "alias": "name",
      "args": null,
      "kind": "ScalarField",
      "name": "__name_name_handler",
      "storageKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "e1918f3ec851d4cff68b89ce1e4c471c";
}

module.exports = node;
