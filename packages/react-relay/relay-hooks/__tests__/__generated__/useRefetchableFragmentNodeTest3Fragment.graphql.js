/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9a8e6d62d25a5d79047dcc1db10f00d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { useRefetchableFragmentNodeTest2Fragment$fragmentType } from "./useRefetchableFragmentNodeTest2Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest3Fragment$fragmentType: FragmentType;
type useRefetchableFragmentNodeTest3FragmentRefetchQuery$variables = any;
export type useRefetchableFragmentNodeTest3Fragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useRefetchableFragmentNodeTest2Fragment$fragmentType,
  +$fragmentType: useRefetchableFragmentNodeTest3Fragment$fragmentType,
|};
export type useRefetchableFragmentNodeTest3Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest3Fragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTest3Fragment$fragmentType,
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
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
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

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useRefetchableFragmentNodeTest3Fragment$fragmentType,
  useRefetchableFragmentNodeTest3Fragment$data,
  useRefetchableFragmentNodeTest3FragmentRefetchQuery$variables,
>*/);
