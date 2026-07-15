/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dbc02820e819aab3a1f133d247897164>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
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
