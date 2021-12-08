/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9092389a97562b157c22a360a2df1b9b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
type useRefetchableFragmentNodeTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTestUserFragment$ref = useRefetchableFragmentNodeTestUserFragment$fragmentType;
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
export type useRefetchableFragmentNodeTestUserFragment = useRefetchableFragmentNodeTestUserFragment$data;
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
      "identifierField": "id"
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
  (node/*: any*/).hash = "05ecfc568de9d9914217013ff67f7014";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useRefetchableFragmentNodeTestUserFragment$fragmentType,
  useRefetchableFragmentNodeTestUserFragment$data,
  useRefetchableFragmentNodeTestUserFragmentRefetchQuery$variables,
>*/);
