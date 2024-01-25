/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f730b9a423685fe71dbe4f396c76ceee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentWithOperationTrackerSuspenseTestFragment$fragmentType: FragmentType;
export type useFragmentWithOperationTrackerSuspenseTestFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: useFragmentWithOperationTrackerSuspenseTestFragment$fragmentType,
|};
export type useFragmentWithOperationTrackerSuspenseTestFragment$key = {
  +$data?: useFragmentWithOperationTrackerSuspenseTestFragment$data,
  +$fragmentSpreads: useFragmentWithOperationTrackerSuspenseTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentWithOperationTrackerSuspenseTestFragment",
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
  (node/*: any*/).hash = "e67c0ce55318d8914b7c4ac00075e14e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentWithOperationTrackerSuspenseTestFragment$fragmentType,
  useFragmentWithOperationTrackerSuspenseTestFragment$data,
>*/);
