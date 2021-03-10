/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<df3884a696f363ac219b7f52af08857d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref = any;
type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType = any;
export type { useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref, useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$fragmentType };
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$ref,
  +$refType: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref,
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$data = useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$key = {
  +$data?: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment$ref,
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

module.exports = node;
