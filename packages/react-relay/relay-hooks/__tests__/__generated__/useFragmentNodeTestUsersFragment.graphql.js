/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c502957203f5a0a8eb88fd805244bbc3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { useFragmentNodeTestNestedUserFragment$fragmentType } from "./useFragmentNodeTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentNodeTestUsersFragment$fragmentType: FragmentType;
export type useFragmentNodeTestUsersFragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useFragmentNodeTestNestedUserFragment$fragmentType,
  +$fragmentType: useFragmentNodeTestUsersFragment$fragmentType,
|}>;
export type useFragmentNodeTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: useFragmentNodeTestUsersFragment$data,
  +$fragmentSpreads: useFragmentNodeTestUsersFragment$fragmentType,
  ...
}>;
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
    "plural": true
  },
  "name": "useFragmentNodeTestUsersFragment",
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
      "name": "useFragmentNodeTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "21820b2b5754dc640e5b08199a2a0498";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentNodeTestUsersFragment$fragmentType,
  useFragmentNodeTestUsersFragment$data,
>*/);
