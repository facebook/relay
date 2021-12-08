/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0be6ec6fddad730f81d7402c21d45141>>
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
declare export opaque type getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType: FragmentType;
export type getFragmentIdentifierTest1UserFragmentWithArgs$ref = getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType;
export type getFragmentIdentifierTest1UserFragmentWithArgs$data = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  +$fragmentType: getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
|};
export type getFragmentIdentifierTest1UserFragmentWithArgs = getFragmentIdentifierTest1UserFragmentWithArgs$data;
export type getFragmentIdentifierTest1UserFragmentWithArgs$key = {
  +$data?: getFragmentIdentifierTest1UserFragmentWithArgs$data,
  +$fragmentSpreads: getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
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
  "name": "getFragmentIdentifierTest1UserFragmentWithArgs",
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
      "name": "getFragmentIdentifierTest1NestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "4ff79780722b7be51dec047a23d9aed6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
  getFragmentIdentifierTest1UserFragmentWithArgs$data,
>*/);
