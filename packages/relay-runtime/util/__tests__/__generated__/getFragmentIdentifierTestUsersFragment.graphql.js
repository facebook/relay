/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7735cd67c252a5fb3f023206288ccf7c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type getFragmentIdentifierTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type getFragmentIdentifierTestUsersFragment$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTestUsersFragment$fragmentType: getFragmentIdentifierTestUsersFragment$ref;
export type getFragmentIdentifierTestUsersFragment = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: getFragmentIdentifierTestNestedUserFragment$ref,
  +$refType: getFragmentIdentifierTestUsersFragment$ref,
|}>;
export type getFragmentIdentifierTestUsersFragment$data = getFragmentIdentifierTestUsersFragment;
export type getFragmentIdentifierTestUsersFragment$key = $ReadOnlyArray<{
  +$data?: getFragmentIdentifierTestUsersFragment$data,
  +$fragmentRefs: getFragmentIdentifierTestUsersFragment$ref,
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

module.exports = node;
