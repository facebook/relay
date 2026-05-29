/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f84e273dabb63fcd0a2af75d83d1a0cc>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTest1UserFragment$fragmentType: FragmentType;
export type GraphQLTagTest1UserFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: GraphQLTagTest1UserFragment$fragmentType,
};
export type GraphQLTagTest1UserFragment$key = {
  readonly $data?: GraphQLTagTest1UserFragment$data,
  readonly $fragmentSpreads: GraphQLTagTest1UserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GraphQLTagTest1UserFragment",
  "selections": [
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
  (node/*:: as any*/).hash = "fced6c5e36db6981177c0fbd5f001550";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  GraphQLTagTest1UserFragment$fragmentType,
  GraphQLTagTest1UserFragment$data,
>*/);
