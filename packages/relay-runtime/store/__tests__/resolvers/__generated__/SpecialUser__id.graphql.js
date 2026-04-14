/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3fe00e242962080bfaa7c113b6645607>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type SpecialUser__id$fragmentType: FragmentType;
export type SpecialUser__id$data = {|
  +id: string,
  +$fragmentType: SpecialUser__id$fragmentType,
|};
export type SpecialUser__id$key = {
  +$data?: SpecialUser__id$data,
  +$fragmentSpreads: SpecialUser__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SpecialUser__id",
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
  "type": "SpecialUser",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  SpecialUser__id$fragmentType,
  SpecialUser__id$data,
>*/);
