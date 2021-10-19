/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<24a83d08d9f58cb3041f9a1288e39eb3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type useRefetchableFragmentTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
type useRefetchableFragmentTestUserFragment$ref = any;
type useRefetchableFragmentTestUserFragment$fragmentType = any;
export type { useRefetchableFragmentTestUserFragment$ref, useRefetchableFragmentTestUserFragment$fragmentType };
export type useRefetchableFragmentTestUserFragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: useRefetchableFragmentTestNestedUserFragment$ref,
  +$refType: useRefetchableFragmentTestUserFragment$ref,
|};
export type useRefetchableFragmentTestUserFragment$data = useRefetchableFragmentTestUserFragment;
export type useRefetchableFragmentTestUserFragment$key = {
  +$data?: useRefetchableFragmentTestUserFragment$data,
  +$fragmentRefs: useRefetchableFragmentTestUserFragment$ref,
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
      "identifierField": "id"
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
  (node/*: any*/).hash = "d770b0dc72756ed4ba66dee386a91acf";
}

module.exports = node;
