/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7c795f5e50d2997593145ca8ca8cc843>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$ref;
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data = RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment;
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment",
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
  (node/*: any*/).hash = "028d0d736b7bf6e919745eedfe435049";
}

module.exports = node;
