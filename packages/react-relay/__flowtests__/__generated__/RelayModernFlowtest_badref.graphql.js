/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<712dde6a5a2b8e5da922596c5efe5d4c>>
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
declare export opaque type RelayModernFlowtest_badref$ref: FragmentReference;
declare export opaque type RelayModernFlowtest_badref$fragmentType: RelayModernFlowtest_badref$ref;
export type RelayModernFlowtest_badref = {|
  +id: string,
  +$fragmentRefs: RelayModernFlowtest_user$ref,
  +$refType: RelayModernFlowtest_badref$ref,
|};
export type RelayModernFlowtest_badref$data = RelayModernFlowtest_badref;
export type RelayModernFlowtest_badref$key = {
  +$data?: RelayModernFlowtest_badref$data,
  +$fragmentRefs: RelayModernFlowtest_badref$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFlowtest_badref",
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
  (node/*: any*/).hash = "a04dc2854770919bd070bdc717de7812";
}

module.exports = node;
