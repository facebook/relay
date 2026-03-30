/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<890afbdcb8e28ee63f939fcec46762bf>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "657ef41d464979f0bec9509df67c2ad4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
  RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data,
>*/);
