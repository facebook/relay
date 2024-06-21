/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<488137e059826e157a95ea8a087abedd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentWithOperationTrackerSuspenseTest2Fragment$fragmentType: FragmentType;
export type useFragmentWithOperationTrackerSuspenseTest2Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +$fragmentType: useFragmentWithOperationTrackerSuspenseTest2Fragment$fragmentType,
|}>;
export type useFragmentWithOperationTrackerSuspenseTest2Fragment$key = $ReadOnlyArray<{
  +$data?: useFragmentWithOperationTrackerSuspenseTest2Fragment$data,
  +$fragmentSpreads: useFragmentWithOperationTrackerSuspenseTest2Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useFragmentWithOperationTrackerSuspenseTest2Fragment",
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
  (node/*: any*/).hash = "ed248350d2cf54c3301858051ee10660";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentWithOperationTrackerSuspenseTest2Fragment$fragmentType,
  useFragmentWithOperationTrackerSuspenseTest2Fragment$data,
>*/);
