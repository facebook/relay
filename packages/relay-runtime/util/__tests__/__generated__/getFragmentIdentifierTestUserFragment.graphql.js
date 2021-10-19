/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<513bb80b1502a5e1535b90d00c83f7dd>>
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
declare export opaque type getFragmentIdentifierTestUserFragment$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTestUserFragment$fragmentType: getFragmentIdentifierTestUserFragment$ref;
export type getFragmentIdentifierTestUserFragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: getFragmentIdentifierTestNestedUserFragment$ref,
  +$refType: getFragmentIdentifierTestUserFragment$ref,
|};
export type getFragmentIdentifierTestUserFragment$data = getFragmentIdentifierTestUserFragment;
export type getFragmentIdentifierTestUserFragment$key = {
  +$data?: getFragmentIdentifierTestUserFragment$data,
  +$fragmentRefs: getFragmentIdentifierTestUserFragment$ref,
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

module.exports = node;
