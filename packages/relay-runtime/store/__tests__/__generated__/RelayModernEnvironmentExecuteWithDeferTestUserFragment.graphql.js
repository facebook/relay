/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b591d5cd81c04f6bbfe240c9d7113812>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferTestUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferTestUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "eed70db622188a89bf789b59e251237f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferTestUserFragment$data,
>*/);
