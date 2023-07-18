/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9140b5d003eaf8ad8af413ad7e1005d5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType,
|};
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$key = {
  +$data?: FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$data,
  +$fragmentSpreads: FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment",
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
  (node/*: any*/).hash = "608a07a152032988a6413ca6f1dbfbaf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType,
  FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$data,
>*/);
