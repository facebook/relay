/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<14976213c61d94f46f2b25902d44def8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernFlowtest_user$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFlowtest_notref$ref: FragmentReference;
declare export opaque type RelayModernFlowtest_notref$fragmentType: RelayModernFlowtest_notref$ref;
export type RelayModernFlowtest_notref = {|
  +id: string,
  +$fragmentRefs: RelayModernFlowtest_user$ref,
  +$refType: RelayModernFlowtest_notref$ref,
|};
export type RelayModernFlowtest_notref$data = RelayModernFlowtest_notref;
export type RelayModernFlowtest_notref$key = {
  +$data?: RelayModernFlowtest_notref$data,
  +$fragmentRefs: RelayModernFlowtest_notref$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFlowtest_notref",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernFlowtest_user"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d61c43d07b2fe8f623c9b84fcdf70ac8";
}

module.exports = node;
