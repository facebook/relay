/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4c9a13120a87d10912cd840d3b028430>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data,
>*/);
