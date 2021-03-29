/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<95bbc648681a6b4e622baf6e330e6bfc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type useFragmentNodeTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type useFragmentNodeTestUserFragment$ref: FragmentReference;
declare export opaque type useFragmentNodeTestUserFragment$fragmentType: useFragmentNodeTestUserFragment$ref;
export type useFragmentNodeTestUserFragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: useFragmentNodeTestNestedUserFragment$ref,
  +$refType: useFragmentNodeTestUserFragment$ref,
|};
export type useFragmentNodeTestUserFragment$data = useFragmentNodeTestUserFragment;
export type useFragmentNodeTestUserFragment$key = {
  +$data?: useFragmentNodeTestUserFragment$data,
  +$fragmentRefs: useFragmentNodeTestUserFragment$ref,
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

module.exports = node;
