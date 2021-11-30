/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2e6de02332132a03de07b1bee9c8ceac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernFlowtest_user$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFlowtest_badref$fragmentType: FragmentType;
export type RelayModernFlowtest_badref$ref = RelayModernFlowtest_badref$fragmentType;
export type RelayModernFlowtest_badref$data = {|
  +id: string,
  +$fragmentSpreads: RelayModernFlowtest_user$fragmentType,
  +$fragmentType: RelayModernFlowtest_badref$fragmentType,
|};
export type RelayModernFlowtest_badref = RelayModernFlowtest_badref$data;
export type RelayModernFlowtest_badref$key = {
  +$data?: RelayModernFlowtest_badref$data,
  +$fragmentSpreads: RelayModernFlowtest_badref$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFlowtest_badref$fragmentType,
  RelayModernFlowtest_badref$data,
>*/);
