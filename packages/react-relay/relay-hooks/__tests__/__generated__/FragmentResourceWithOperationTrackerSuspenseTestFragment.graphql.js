/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6b85ffd10ca4c803f16753d66e7f0613>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerSuspenseTestFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType,
|};
export type FragmentResourceWithOperationTrackerSuspenseTestFragment$key = {
  +$data?: FragmentResourceWithOperationTrackerSuspenseTestFragment$data,
  +$fragmentSpreads: FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceWithOperationTrackerSuspenseTestFragment",
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
  (node/*: any*/).hash = "e12427787bafaeb86e94ee353ec32606";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType,
  FragmentResourceWithOperationTrackerSuspenseTestFragment$data,
>*/);
