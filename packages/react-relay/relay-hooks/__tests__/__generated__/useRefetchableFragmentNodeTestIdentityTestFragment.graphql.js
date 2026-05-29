/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3f436459d0cb9ddd3688ac8462d667f8>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestIdentityTestFragment$fragmentType: FragmentType;
type useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$variables = any;
export type useRefetchableFragmentNodeTestIdentityTestFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: useRefetchableFragmentNodeTestIdentityTestFragment$fragmentType,
};
export type useRefetchableFragmentNodeTestIdentityTestFragment$key = {
  readonly $data?: useRefetchableFragmentNodeTestIdentityTestFragment$data,
  readonly $fragmentSpreads: useRefetchableFragmentNodeTestIdentityTestFragment$fragmentType,
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
      "operation": require('./useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "useRefetchableFragmentNodeTestIdentityTestFragment",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "0b309ceb5fea8ea44abb827cce31328b";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  useRefetchableFragmentNodeTestIdentityTestFragment$fragmentType,
  useRefetchableFragmentNodeTestIdentityTestFragment$data,
  useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$variables,
>*/);
