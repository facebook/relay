/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b719eb284c479cba4008e67c0c7cb42c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTest1UserFragment$fragmentType: FragmentType;
export type GraphQLTagTest1UserFragment$ref = GraphQLTagTest1UserFragment$fragmentType;
export type GraphQLTagTest1UserFragment$data = {|
  +name: ?string,
  +$refType: GraphQLTagTest1UserFragment$fragmentType,
  +$fragmentType: GraphQLTagTest1UserFragment$fragmentType,
|};
export type GraphQLTagTest1UserFragment = GraphQLTagTest1UserFragment$data;
export type GraphQLTagTest1UserFragment$key = {
  +$data?: GraphQLTagTest1UserFragment$data,
  +$fragmentRefs: GraphQLTagTest1UserFragment$fragmentType,
  +$fragmentSpreads: GraphQLTagTest1UserFragment$fragmentType,
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
  (node/*: any*/).hash = "fced6c5e36db6981177c0fbd5f001550";
}

module.exports = ((node/*: any*/)/*: Fragment<
  GraphQLTagTest1UserFragment$fragmentType,
  GraphQLTagTest1UserFragment$data,
>*/);
