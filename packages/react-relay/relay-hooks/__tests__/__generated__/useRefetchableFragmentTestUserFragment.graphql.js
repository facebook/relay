/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a3361cc8d34d7d7aa211954302187d1e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { useRefetchableFragmentTestNestedUserFragment$fragmentType } from "./useRefetchableFragmentTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentTestUserFragment$fragmentType: FragmentType;
type useRefetchableFragmentTestUserFragmentRefetchQuery$variables = any;
export type useRefetchableFragmentTestUserFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentSpreads: useRefetchableFragmentTestNestedUserFragment$fragmentType,
  readonly $fragmentType: useRefetchableFragmentTestUserFragment$fragmentType,
};
export type useRefetchableFragmentTestUserFragment$key = {
  readonly $data?: useRefetchableFragmentTestUserFragment$data,
  readonly $fragmentSpreads: useRefetchableFragmentTestUserFragment$fragmentType,
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
      "operation": require('./useRefetchableFragmentTestUserFragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "useRefetchableFragmentTestUserFragment",
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
      "name": "useRefetchableFragmentTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "d770b0dc72756ed4ba66dee386a91acf";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  useRefetchableFragmentTestUserFragment$fragmentType,
  useRefetchableFragmentTestUserFragment$data,
  useRefetchableFragmentTestUserFragmentRefetchQuery$variables,
>*/);
