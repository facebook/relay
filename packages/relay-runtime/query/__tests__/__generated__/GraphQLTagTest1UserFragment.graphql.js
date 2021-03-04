/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9153aa1eefb9ac9d5f3b53e78b5ffbc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type GraphQLTagTest1UserFragment$ref: FragmentReference;
declare export opaque type GraphQLTagTest1UserFragment$fragmentType: GraphQLTagTest1UserFragment$ref;
export type GraphQLTagTest1UserFragment = {|
  +name: ?string,
  +$refType: GraphQLTagTest1UserFragment$ref,
|};
export type GraphQLTagTest1UserFragment$data = GraphQLTagTest1UserFragment;
export type GraphQLTagTest1UserFragment$key = {
  +$data?: GraphQLTagTest1UserFragment$data,
  +$fragmentRefs: GraphQLTagTest1UserFragment$ref,
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

module.exports = node;
