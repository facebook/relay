/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<241a134fabdaf68d11ed4cba9262d172>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest4Fragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTest4Fragment$data = ReadonlyArray<{
  readonly id: string,
  readonly $fragmentType: useRefetchableFragmentNodeTest4Fragment$fragmentType,
}>;
export type useRefetchableFragmentNodeTest4Fragment$key = ReadonlyArray<{
  readonly $data?: useRefetchableFragmentNodeTest4Fragment$data,
  readonly $fragmentSpreads: useRefetchableFragmentNodeTest4Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useRefetchableFragmentNodeTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "aefb7faae26173c6c2f8bba8aedab15b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useRefetchableFragmentNodeTest4Fragment$fragmentType,
  useRefetchableFragmentNodeTest4Fragment$data,
>*/);
