/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cbe7dd9e625509ce29dc4335513a8110>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type GraphQLTagTestUserFragment$fragmentType: FragmentType;
export type GraphQLTagTestUserFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: GraphQLTagTestUserFragment$fragmentType,
};
export type GraphQLTagTestUserFragment$key = {
  readonly $data?: GraphQLTagTestUserFragment$data,
  readonly $fragmentSpreads: GraphQLTagTestUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "0a00ab1ef7806bd10be2e04216b3e342";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  GraphQLTagTestUserFragment$fragmentType,
  GraphQLTagTestUserFragment$data,
>*/);
