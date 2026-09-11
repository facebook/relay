/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7339bbc08dcc5405fe33f4b747b3dfc2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { useFragmentActivitySnapshotTestList$fragmentType } from "./useFragmentActivitySnapshotTestList.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentActivitySnapshotTestPluralRoot$fragmentType: FragmentType;
export type useFragmentActivitySnapshotTestPluralRoot$data = ReadonlyArray<{
  readonly $fragmentSpreads: useFragmentActivitySnapshotTestList$fragmentType,
  readonly $fragmentType: useFragmentActivitySnapshotTestPluralRoot$fragmentType,
}>;
export type useFragmentActivitySnapshotTestPluralRoot$key = ReadonlyArray<{
  readonly $data?: useFragmentActivitySnapshotTestPluralRoot$data,
  readonly $fragmentSpreads: useFragmentActivitySnapshotTestPluralRoot$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useFragmentActivitySnapshotTestPluralRoot",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useFragmentActivitySnapshotTestList"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "10e355e405b4ab8d5468d34086d221ac";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentActivitySnapshotTestPluralRoot$fragmentType,
  useFragmentActivitySnapshotTestPluralRoot$data,
>*/);
