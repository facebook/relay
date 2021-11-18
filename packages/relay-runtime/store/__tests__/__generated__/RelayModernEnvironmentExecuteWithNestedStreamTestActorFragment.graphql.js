/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6f0ac9abf1ab527f05e1395fab32647d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$ref = RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment = RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data;
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
  (node/*: any*/).hash = "657ef41d464979f0bec9509df67c2ad4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$fragmentType,
  RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment$data,
>*/);
