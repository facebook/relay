/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c277ac1e4b3cc96fdfca45e262d80879>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type Car__id$fragmentType: FragmentType;
export type Car__id$data = {
  readonly id: string,
  readonly $fragmentType: Car__id$fragmentType,
};
export type Car__id$key = {
  readonly $data?: Car__id$data,
  readonly $fragmentSpreads: Car__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Car__id",
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
  "type": "Car",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  Car__id$fragmentType,
  Car__id$data,
>*/);
