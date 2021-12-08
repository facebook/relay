/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<146cd5f838e4b120d3579ce6af2952bd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
type useRefetchableFragmentTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentTestUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentTestUserFragment$ref = useRefetchableFragmentTestUserFragment$fragmentType;
type useRefetchableFragmentTestUserFragmentRefetchQuery$variables = any;
export type useRefetchableFragmentTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useRefetchableFragmentTestNestedUserFragment$fragmentType,
  +$fragmentType: useRefetchableFragmentTestUserFragment$fragmentType,
|};
export type useRefetchableFragmentTestUserFragment = useRefetchableFragmentTestUserFragment$data;
export type useRefetchableFragmentTestUserFragment$key = {
  +$data?: useRefetchableFragmentTestUserFragment$data,
  +$fragmentSpreads: useRefetchableFragmentTestUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useRefetchableFragmentTestUserFragment$fragmentType,
  useRefetchableFragmentTestUserFragment$data,
  useRefetchableFragmentTestUserFragmentRefetchQuery$variables,
>*/);
