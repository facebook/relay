/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<77247515b129d64ff5a58c0200f65c65>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type getFragmentIdentifierTest1NestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1UserFragment$fragmentType: FragmentType;
export type getFragmentIdentifierTest1UserFragment$ref = getFragmentIdentifierTest1UserFragment$fragmentType;
export type getFragmentIdentifierTest1UserFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  +$fragmentType: getFragmentIdentifierTest1UserFragment$fragmentType,
|};
export type getFragmentIdentifierTest1UserFragment = getFragmentIdentifierTest1UserFragment$data;
export type getFragmentIdentifierTest1UserFragment$key = {
  +$data?: getFragmentIdentifierTest1UserFragment$data,
  +$fragmentSpreads: getFragmentIdentifierTest1UserFragment$fragmentType,
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
  "name": "getFragmentIdentifierTest1UserFragment",
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
  (node/*: any*/).hash = "6ce99bf04f9f04381026f4e525ea79bd";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTest1UserFragment$fragmentType,
  getFragmentIdentifierTest1UserFragment$data,
>*/);
