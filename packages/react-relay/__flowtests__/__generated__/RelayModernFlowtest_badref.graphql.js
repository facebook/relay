/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d67fc8ab171aeb4c45cb1df2d036371>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernFlowtest_user$fragmentType } from "./RelayModernFlowtest_user.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFlowtest_badref$fragmentType: FragmentType;
export type RelayModernFlowtest_badref$data = {|
  +id: string,
  +$fragmentSpreads: RelayModernFlowtest_user$fragmentType,
  +$fragmentType: RelayModernFlowtest_badref$fragmentType,
|};
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
