/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<147c20daa88840209a0655f701e67d5e>>
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
declare export opaque type getFragmentIdentifierTestUserFragmentWithArgs$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTestUserFragmentWithArgs$fragmentType: getFragmentIdentifierTestUserFragmentWithArgs$ref;
export type getFragmentIdentifierTestUserFragmentWithArgs = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string
  |},
  +$fragmentRefs: getFragmentIdentifierTestNestedUserFragment$ref,
  +$refType: getFragmentIdentifierTestUserFragmentWithArgs$ref,
|};
export type getFragmentIdentifierTestUserFragmentWithArgs$data = getFragmentIdentifierTestUserFragmentWithArgs;
export type getFragmentIdentifierTestUserFragmentWithArgs$key = {
  +$data?: getFragmentIdentifierTestUserFragmentWithArgs$data,
  +$fragmentRefs: getFragmentIdentifierTestUserFragmentWithArgs$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scaleLocal"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getFragmentIdentifierTestUserFragmentWithArgs",
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
          "variableName": "scaleLocal"
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
  (node/*: any*/).hash = "75c2ec23dd5f2fadabaf66b31ec9db5c";
}

module.exports = node;
