/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4ff56e783449a2ae86566ae6c84c665b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest4Fragment$fragmentType: FragmentType;
export type FragmentResourceTest4Fragment$ref = FragmentResourceTest4Fragment$fragmentType;
export type FragmentResourceTest4Fragment$data = {|
  +node: ?{|
    +__typename: string,
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: FragmentResourceTest4Fragment$fragmentType,
|};
export type FragmentResourceTest4Fragment = FragmentResourceTest4Fragment$data;
export type FragmentResourceTest4Fragment$key = {
  +$data?: FragmentResourceTest4Fragment$data,
  +$fragmentSpreads: FragmentResourceTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "id"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "id"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1510237cc098d600839f94a284d981aa";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest4Fragment$fragmentType,
  FragmentResourceTest4Fragment$data,
>*/);
