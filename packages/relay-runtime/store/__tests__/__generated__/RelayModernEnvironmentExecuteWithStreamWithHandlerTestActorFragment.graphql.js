/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2e49eec535132f2730c0191cc2b6d2ea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$ref = RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment = RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$data;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$fragmentType,
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "19647d402a1baa808f96cc3699c2b452";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$fragmentType,
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment$data,
>*/);
