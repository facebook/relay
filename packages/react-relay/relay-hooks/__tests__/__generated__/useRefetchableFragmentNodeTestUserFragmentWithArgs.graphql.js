/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<da01f8483a41c533597cb210e0312747>>
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
type useRefetchableFragmentNodeTestUserFragmentWithArgs$ref = any;
type useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType = any;
export type { useRefetchableFragmentNodeTestUserFragmentWithArgs$ref, useRefetchableFragmentNodeTestUserFragmentWithArgs$fragmentType };
export type useRefetchableFragmentNodeTestUserFragmentWithArgs = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: useRefetchableFragmentNodeTestNestedUserFragment$ref,
  +$refType: useRefetchableFragmentNodeTestUserFragmentWithArgs$ref,
|};
export type useRefetchableFragmentNodeTestUserFragmentWithArgs$data = useRefetchableFragmentNodeTestUserFragmentWithArgs;
export type useRefetchableFragmentNodeTestUserFragmentWithArgs$key = {
  +$data?: useRefetchableFragmentNodeTestUserFragmentWithArgs$data,
  +$fragmentRefs: useRefetchableFragmentNodeTestUserFragmentWithArgs$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scaleLocal"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./useRefetchableFragmentNodeTestUserFragmentWithArgsRefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "useRefetchableFragmentNodeTestUserFragmentWithArgs",
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
          "variableName": "scaleLocal"
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
  (node/*: any*/).hash = "66560c7839480e9e6d2891c5dbcd2039";
}

module.exports = node;
