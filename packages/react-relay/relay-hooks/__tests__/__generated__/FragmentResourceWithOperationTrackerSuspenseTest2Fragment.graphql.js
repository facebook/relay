/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d5859996ad97e096452b36772533aa3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerSuspenseTest2Fragment$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerSuspenseTest2Fragment$data = ReadonlyArray<{|
  +id: string,
  +name: ?string,
  +$fragmentType: FragmentResourceWithOperationTrackerSuspenseTest2Fragment$fragmentType,
|}>;
export type FragmentResourceWithOperationTrackerSuspenseTest2Fragment$key = ReadonlyArray<{
  +$data?: FragmentResourceWithOperationTrackerSuspenseTest2Fragment$data,
  +$fragmentSpreads: FragmentResourceWithOperationTrackerSuspenseTest2Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceWithOperationTrackerSuspenseTest2Fragment",
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
  (node/*: any*/).hash = "d3df6c392eb4ca3ce9a0c63f7b9f9936";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceWithOperationTrackerSuspenseTest2Fragment$fragmentType,
  FragmentResourceWithOperationTrackerSuspenseTest2Fragment$data,
>*/);
