/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<03e112780d9eec9aec3aa807f5574838>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$data = {
  readonly alternate_name: ?string,
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "alternate_name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "4b79bfcf55bae011316837b3e3b79a6c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferTestUserOverlappingFieldsFragment$data,
>*/);
