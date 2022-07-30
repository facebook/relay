/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9f9bbfeadb2aa46f99b830beb46fad75>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTestUserFragment$fragmentType: FragmentType;
export type GraphQLTagTestUserFragment$data = {|
  +name: ?string,
  +$fragmentType: GraphQLTagTestUserFragment$fragmentType,
|};
export type GraphQLTagTestUserFragment$key = {
  +$data?: GraphQLTagTestUserFragment$data,
  +$fragmentSpreads: GraphQLTagTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GraphQLTagTestUserFragment",
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
  (node/*: any*/).hash = "0a00ab1ef7806bd10be2e04216b3e342";
}

module.exports = ((node/*: any*/)/*: Fragment<
  GraphQLTagTestUserFragment$fragmentType,
  GraphQLTagTestUserFragment$data,
>*/);
