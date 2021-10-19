/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b5cb50aff7644c2401dbbec6b32fb2f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentRetainTestQueryChildFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentRetainTestQueryChildFragment$fragmentType: RelayModernEnvironmentRetainTestQueryChildFragment$ref;
export type RelayModernEnvironmentRetainTestQueryChildFragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentRetainTestQueryChildFragment$ref,
|};
export type RelayModernEnvironmentRetainTestQueryChildFragment$data = RelayModernEnvironmentRetainTestQueryChildFragment;
export type RelayModernEnvironmentRetainTestQueryChildFragment$key = {
  +$data?: RelayModernEnvironmentRetainTestQueryChildFragment$data,
  +$fragmentRefs: RelayModernEnvironmentRetainTestQueryChildFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentRetainTestQueryChildFragment",
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
  (node/*: any*/).hash = "7e69889c742314270a6b436c846a7bc5";
}

module.exports = node;
