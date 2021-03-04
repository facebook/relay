/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e77d8d080eba83f03051fb93f3ebecba>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type GraphQLTagTestUserFragment$ref: FragmentReference;
declare export opaque type GraphQLTagTestUserFragment$fragmentType: GraphQLTagTestUserFragment$ref;
export type GraphQLTagTestUserFragment = {|
  +name: ?string,
  +$refType: GraphQLTagTestUserFragment$ref,
|};
export type GraphQLTagTestUserFragment$data = GraphQLTagTestUserFragment;
export type GraphQLTagTestUserFragment$key = {
  +$data?: GraphQLTagTestUserFragment$data,
  +$fragmentRefs: GraphQLTagTestUserFragment$ref,
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

module.exports = node;
