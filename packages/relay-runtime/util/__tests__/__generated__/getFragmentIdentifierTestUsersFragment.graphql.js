/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3bf0946c52680ed9da586a7df29e6015>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type getFragmentIdentifierTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTestUsersFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTestUsersFragment$ref = getFragmentIdentifierTestUsersFragment$fragmentType;
export type getFragmentIdentifierTestUsersFragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: getFragmentIdentifierTestNestedUserFragment$fragmentType,
  +$fragmentType: getFragmentIdentifierTestUsersFragment$fragmentType,
|}>;
export type getFragmentIdentifierTestUsersFragment = getFragmentIdentifierTestUsersFragment$data;
export type getFragmentIdentifierTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: getFragmentIdentifierTestUsersFragment$data,
  +$fragmentSpreads: getFragmentIdentifierTestUsersFragment$fragmentType,
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
  "name": "getFragmentIdentifierTestUsersFragment",
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
      "name": "getFragmentIdentifierTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d37f0a514c3d60209ae2dec723bc0a47";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTestUsersFragment$fragmentType,
  getFragmentIdentifierTestUsersFragment$data,
>*/);
