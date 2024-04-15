/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47ead1ae3d880ee8b9569a3aafda536a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type Fish__id$fragmentType: FragmentType;
export type Fish__id$data = {|
  +id: string,
  +$fragmentType: Fish__id$fragmentType,
|};
export type Fish__id$key = {
  +$data?: Fish__id$data,
  +$fragmentSpreads: Fish__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Fish__id",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Fish",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  Fish__id$fragmentType,
  Fish__id$data,
>*/);
