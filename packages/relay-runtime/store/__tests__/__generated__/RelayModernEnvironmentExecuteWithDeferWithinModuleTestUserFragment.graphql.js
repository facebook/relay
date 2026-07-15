/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<783298746dceafc56bd2a3c45d1c6a42>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "249818d80bc3fb0e1c6d70a90c1a8b6f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$data,
>*/);
