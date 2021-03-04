/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6e08247d673c71814ac11d874c0acfb7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type useRefetchableFragmentNodeTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
type useRefetchableFragmentNodeTestUserFragment$ref = any;
type useRefetchableFragmentNodeTestUserFragment$fragmentType = any;
export type { useRefetchableFragmentNodeTestUserFragment$ref, useRefetchableFragmentNodeTestUserFragment$fragmentType };
export type useRefetchableFragmentNodeTestUserFragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: useRefetchableFragmentNodeTestNestedUserFragment$ref,
  +$refType: useRefetchableFragmentNodeTestUserFragment$ref,
|};
export type useRefetchableFragmentNodeTestUserFragment$data = useRefetchableFragmentNodeTestUserFragment;
export type useRefetchableFragmentNodeTestUserFragment$key = {
  +$data?: useRefetchableFragmentNodeTestUserFragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTestUserFragment$ref,
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

module.exports = node;
