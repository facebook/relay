/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d0b3984beeb9967b2cf4c6bb2ca9ea2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCommitUpdateTestUserFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType,
};
export type RelayModernEnvironmentCommitUpdateTestUserFragment$key = {
  readonly $data?: RelayModernEnvironmentCommitUpdateTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "b161821fe23ad015bfd2bcd62b919a9d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType,
  RelayModernEnvironmentCommitUpdateTestUserFragment$data,
>*/);
