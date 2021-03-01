/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<036a101f8ce9ff364256983f5f485df4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type getFragmentIdentifierTest1NestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1UsersFragment$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTest1UsersFragment$fragmentType: getFragmentIdentifierTest1UsersFragment$ref;
export type getFragmentIdentifierTest1UsersFragment = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: getFragmentIdentifierTest1NestedUserFragment$ref,
  +$refType: getFragmentIdentifierTest1UsersFragment$ref,
|}>;
export type getFragmentIdentifierTest1UsersFragment$data = getFragmentIdentifierTest1UsersFragment;
export type getFragmentIdentifierTest1UsersFragment$key = $ReadOnlyArray<{
  +$data?: getFragmentIdentifierTest1UsersFragment$data,
  +$fragmentRefs: getFragmentIdentifierTest1UsersFragment$ref,
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

module.exports = node;
