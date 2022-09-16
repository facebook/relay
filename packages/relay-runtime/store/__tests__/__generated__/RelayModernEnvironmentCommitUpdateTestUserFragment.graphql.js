/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d3368500b14aa6eda9dfff6388eb270b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCommitUpdateTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType,
|};
export type RelayModernEnvironmentCommitUpdateTestUserFragment$key = {
  +$data?: RelayModernEnvironmentCommitUpdateTestUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCommitUpdateTestUserFragment",
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
  (node/*: any*/).hash = "b161821fe23ad015bfd2bcd62b919a9d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType,
  RelayModernEnvironmentCommitUpdateTestUserFragment$data,
>*/);
