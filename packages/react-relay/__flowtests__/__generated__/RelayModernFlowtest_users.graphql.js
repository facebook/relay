/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<649c1c769f0d7158a4d1411aeee7bb72>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFlowtest_users$ref: FragmentReference;
declare export opaque type RelayModernFlowtest_users$fragmentType: RelayModernFlowtest_users$ref;
export type RelayModernFlowtest_users = $ReadOnlyArray<{|
  +name: ?string,
  +$refType: RelayModernFlowtest_users$ref,
|}>;
export type RelayModernFlowtest_users$data = RelayModernFlowtest_users;
export type RelayModernFlowtest_users$key = $ReadOnlyArray<{
  +$data?: RelayModernFlowtest_users$data,
  +$fragmentRefs: RelayModernFlowtest_users$ref,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RelayModernFlowtest_users",
  "selections": [
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
  (node/*: any*/).hash = "4e6f0e70d48ec58651c17e3150c63d05";
}

module.exports = node;
