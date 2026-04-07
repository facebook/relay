/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a8d1fa4638f06692d6a29b9b9d3f3a5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { useRefetchableFragmentNodeTestNestedUserFragment$fragmentType } from "./useRefetchableFragmentNodeTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestUserFragment$fragmentType: FragmentType;
type useRefetchableFragmentNodeTestUserFragmentRefetchQuery$variables = any;
export type useRefetchableFragmentNodeTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useRefetchableFragmentNodeTestNestedUserFragment$fragmentType,
  +$fragmentType: useRefetchableFragmentNodeTestUserFragment$fragmentType,
|};
export type useRefetchableFragmentNodeTestUserFragment$key = {
  +$data?: useRefetchableFragmentNodeTestUserFragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "scale"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./useRefetchableFragmentNodeTestUserFragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "useRefetchableFragmentNodeTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scale"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useRefetchableFragmentNodeTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "05ecfc568de9d9914217013ff67f7014";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  useRefetchableFragmentNodeTestUserFragment$fragmentType,
  useRefetchableFragmentNodeTestUserFragment$data,
  useRefetchableFragmentNodeTestUserFragmentRefetchQuery$variables,
>*/);
