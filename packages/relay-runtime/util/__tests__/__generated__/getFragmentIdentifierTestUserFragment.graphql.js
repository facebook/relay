/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5ed8ecf04898a53b6f6b5c5f0c28ef78>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { getFragmentIdentifierTestNestedUserFragment$fragmentType } from "./getFragmentIdentifierTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTestUserFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: getFragmentIdentifierTestNestedUserFragment$fragmentType,
  +$fragmentType: getFragmentIdentifierTestUserFragment$fragmentType,
|};
export type getFragmentIdentifierTestUserFragment$key = {
  +$data?: getFragmentIdentifierTestUserFragment$data,
  +$fragmentSpreads: getFragmentIdentifierTestUserFragment$fragmentType,
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
  "metadata": null,
  "name": "getFragmentIdentifierTestUserFragment",
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
  (node/*: any*/).hash = "2944c736e496f4f838bfe90f6b265a0d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTestUserFragment$fragmentType,
  getFragmentIdentifierTestUserFragment$data,
>*/);
