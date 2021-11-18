/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<51ee93a183c9ed8f842a840faabce1ae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest5Fragment$fragmentType: FragmentType;
export type FragmentResourceTest5Fragment$ref = FragmentResourceTest5Fragment$fragmentType;
export type FragmentResourceTest5Fragment$data = {|
  +node: ?{|
    +__typename: string,
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: FragmentResourceTest5Fragment$fragmentType,
|};
export type FragmentResourceTest5Fragment = FragmentResourceTest5Fragment$data;
export type FragmentResourceTest5Fragment$key = {
  +$data?: FragmentResourceTest5Fragment$data,
  +$fragmentSpreads: FragmentResourceTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "id"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest5Fragment",
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
  (node/*: any*/).hash = "1128d2d9892f66bd2645c34ada2e2d76";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest5Fragment$fragmentType,
  FragmentResourceTest5Fragment$data,
>*/);
