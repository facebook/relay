/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ae1cd765c28660b64dcc6a1ecf08856f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type useRefetchableFragmentNodeTest2Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
type useRefetchableFragmentNodeTest3Fragment$ref = any;
type useRefetchableFragmentNodeTest3Fragment$fragmentType = any;
export type { useRefetchableFragmentNodeTest3Fragment$ref, useRefetchableFragmentNodeTest3Fragment$fragmentType };
export type useRefetchableFragmentNodeTest3Fragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: useRefetchableFragmentNodeTest2Fragment$ref,
  +$refType: useRefetchableFragmentNodeTest3Fragment$ref,
|};
export type useRefetchableFragmentNodeTest3Fragment$data = useRefetchableFragmentNodeTest3Fragment;
export type useRefetchableFragmentNodeTest3Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest3Fragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTest3Fragment$ref,
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
      "operation": require('./useRefetchableFragmentNodeTest3FragmentRefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "useRefetchableFragmentNodeTest3Fragment",
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
      "name": "useRefetchableFragmentNodeTest2Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "2650c4a9699c99058f29e1c1d3554f01";
}

module.exports = node;
