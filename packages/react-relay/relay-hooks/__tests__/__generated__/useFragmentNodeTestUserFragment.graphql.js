/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eba786152a8bc76e2ff8505cb2697800>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type useFragmentNodeTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentNodeTestUserFragment$fragmentType: FragmentType;
export type useFragmentNodeTestUserFragment$ref = useFragmentNodeTestUserFragment$fragmentType;
export type useFragmentNodeTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: useFragmentNodeTestNestedUserFragment$fragmentType,
  +$fragmentType: useFragmentNodeTestUserFragment$fragmentType,
|};
export type useFragmentNodeTestUserFragment = useFragmentNodeTestUserFragment$data;
export type useFragmentNodeTestUserFragment$key = {
  +$data?: useFragmentNodeTestUserFragment$data,
  +$fragmentSpreads: useFragmentNodeTestUserFragment$fragmentType,
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
  "name": "useFragmentNodeTestUserFragment",
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
  (node/*: any*/).hash = "68d21f4767ebb1a7a9f586ed35826203";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentNodeTestUserFragment$fragmentType,
  useFragmentNodeTestUserFragment$data,
>*/);
