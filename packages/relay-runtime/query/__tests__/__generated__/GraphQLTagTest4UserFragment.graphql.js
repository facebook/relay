/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d54f4087da867030dafa3d2ceb1f12f0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type GraphQLTagTest4UserFragment$ref: FragmentReference;
declare export opaque type GraphQLTagTest4UserFragment$fragmentType: GraphQLTagTest4UserFragment$ref;
export type GraphQLTagTest4UserFragment = {|
  +name: ?string,
  +$refType: GraphQLTagTest4UserFragment$ref,
|};
export type GraphQLTagTest4UserFragment$data = GraphQLTagTest4UserFragment;
export type GraphQLTagTest4UserFragment$key = {
  +$data?: GraphQLTagTest4UserFragment$data,
  +$fragmentRefs: GraphQLTagTest4UserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GraphQLTagTest4UserFragment",
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
  (node/*: any*/).hash = "e809c336afd5e5b1b306dd01b4aae34f";
}

module.exports = node;
