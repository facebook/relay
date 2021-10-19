/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d21e35d1617d9310292f4a1226f81c5b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentApplyUpdateTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentApplyUpdateTestUserFragment$fragmentType: RelayModernEnvironmentApplyUpdateTestUserFragment$ref;
export type RelayModernEnvironmentApplyUpdateTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentApplyUpdateTestUserFragment$ref,
|};
export type RelayModernEnvironmentApplyUpdateTestUserFragment$data = RelayModernEnvironmentApplyUpdateTestUserFragment;
export type RelayModernEnvironmentApplyUpdateTestUserFragment$key = {
  +$data?: RelayModernEnvironmentApplyUpdateTestUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentApplyUpdateTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentApplyUpdateTestUserFragment",
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
  (node/*: any*/).hash = "59a86b8db77168741fbfd84fdf0c472c";
}

module.exports = node;
