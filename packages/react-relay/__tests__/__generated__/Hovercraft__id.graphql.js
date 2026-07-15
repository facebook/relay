/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<40585e092d1143640e676d7489026f11>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type Hovercraft__id$fragmentType: FragmentType;
export type Hovercraft__id$data = {
  readonly id: string,
  readonly $fragmentType: Hovercraft__id$fragmentType,
};
export type Hovercraft__id$key = {
  readonly $data?: Hovercraft__id$data,
  readonly $fragmentSpreads: Hovercraft__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Hovercraft__id",
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
  "type": "Hovercraft",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  Hovercraft__id$fragmentType,
  Hovercraft__id$data,
>*/);
