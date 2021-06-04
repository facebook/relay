/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7c53a6949b52c282b306af2489af534d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFlowtest_user$ref: FragmentReference;
declare export opaque type RelayModernFlowtest_user$fragmentType: RelayModernFlowtest_user$ref;
export type RelayModernFlowtest_user = {|
  +name: ?string,
  +$refType: RelayModernFlowtest_user$ref,
|};
export type RelayModernFlowtest_user$data = RelayModernFlowtest_user;
export type RelayModernFlowtest_user$key = {
  +$data?: RelayModernFlowtest_user$data,
  +$fragmentRefs: RelayModernFlowtest_user$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFlowtest_user",
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
  (node/*: any*/).hash = "18a730295ff54e88446f4f000f5fef7e";
}

module.exports = node;
