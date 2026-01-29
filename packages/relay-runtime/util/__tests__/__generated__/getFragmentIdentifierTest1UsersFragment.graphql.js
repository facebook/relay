/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b462d358b8da73f0aea16f193d4df890>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { getFragmentIdentifierTest1NestedUserFragment$fragmentType } from "./getFragmentIdentifierTest1NestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1UsersFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTest1UsersFragment$data = ReadonlyArray<{|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  +$fragmentType: getFragmentIdentifierTest1UsersFragment$fragmentType,
|}>;
export type getFragmentIdentifierTest1UsersFragment$key = ReadonlyArray<{
  +$data?: getFragmentIdentifierTest1UsersFragment$data,
  +$fragmentSpreads: getFragmentIdentifierTest1UsersFragment$fragmentType,
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
  "name": "getFragmentIdentifierTest1UsersFragment",
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
      "name": "getFragmentIdentifierTest1NestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "91093197aa73a4d03537ace3e1561d6e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTest1UsersFragment$fragmentType,
  getFragmentIdentifierTest1UsersFragment$data,
>*/);
