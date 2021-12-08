/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<440691a2565e187a21196c717457dcc6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTest4UserFragment$fragmentType: FragmentType;
export type GraphQLTagTest4UserFragment$ref = GraphQLTagTest4UserFragment$fragmentType;
export type GraphQLTagTest4UserFragment$data = {|
  +name: ?string,
  +$fragmentType: GraphQLTagTest4UserFragment$fragmentType,
|};
export type GraphQLTagTest4UserFragment = GraphQLTagTest4UserFragment$data;
export type GraphQLTagTest4UserFragment$key = {
  +$data?: GraphQLTagTest4UserFragment$data,
  +$fragmentSpreads: GraphQLTagTest4UserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  GraphQLTagTest4UserFragment$fragmentType,
  GraphQLTagTest4UserFragment$data,
>*/);
