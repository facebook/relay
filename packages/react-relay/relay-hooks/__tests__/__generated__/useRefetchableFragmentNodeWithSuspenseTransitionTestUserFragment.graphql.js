/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e0ad5f59cc05f6d9f7ce50696f5b0d54>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref = useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType;
type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery$variables = any;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  +$fragmentType: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType,
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment = useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$data;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$key = {
  +$data?: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType,
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
      "operation": require('./useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment",
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
      "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5667a4d9b630416b46fa8e8124d4470c";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType,
  useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$data,
  useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery$variables,
>*/);
