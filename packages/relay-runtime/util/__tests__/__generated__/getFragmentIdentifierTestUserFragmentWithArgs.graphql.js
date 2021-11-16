/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9e184fa5695f737579d279b9bf3ae04>>
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
declare export opaque type getFragmentIdentifierTestUserFragmentWithArgs$fragmentType: FragmentType;
export type getFragmentIdentifierTestUserFragmentWithArgs$ref = getFragmentIdentifierTestUserFragmentWithArgs$fragmentType;
export type getFragmentIdentifierTestUserFragmentWithArgs$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: getFragmentIdentifierTestNestedUserFragment$fragmentType,
  +$fragmentSpreads: getFragmentIdentifierTestNestedUserFragment$fragmentType,
  +$refType: getFragmentIdentifierTestUserFragmentWithArgs$fragmentType,
  +$fragmentType: getFragmentIdentifierTestUserFragmentWithArgs$fragmentType,
|};
export type getFragmentIdentifierTestUserFragmentWithArgs = getFragmentIdentifierTestUserFragmentWithArgs$data;
export type getFragmentIdentifierTestUserFragmentWithArgs$key = {
  +$data?: getFragmentIdentifierTestUserFragmentWithArgs$data,
  +$fragmentRefs: getFragmentIdentifierTestUserFragmentWithArgs$fragmentType,
  +$fragmentSpreads: getFragmentIdentifierTestUserFragmentWithArgs$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTestUserFragmentWithArgs$fragmentType,
  getFragmentIdentifierTestUserFragmentWithArgs$data,
>*/);
