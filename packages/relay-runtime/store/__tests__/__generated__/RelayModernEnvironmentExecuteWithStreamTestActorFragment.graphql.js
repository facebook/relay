/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8d1c96e5aae1a1e3cbed70785abd607f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamTestActorFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithStreamTestActorFragment$fragmentType: RelayModernEnvironmentExecuteWithStreamTestActorFragment$ref;
export type RelayModernEnvironmentExecuteWithStreamTestActorFragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentExecuteWithStreamTestActorFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithStreamTestActorFragment$data = RelayModernEnvironmentExecuteWithStreamTestActorFragment;
export type RelayModernEnvironmentExecuteWithStreamTestActorFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamTestActorFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithStreamTestActorFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithStreamTestActorFragment",
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
  (node/*: any*/).hash = "b6d3cf05bfea15497411e0b749651ed7";
}

module.exports = node;
