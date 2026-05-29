/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<360f15534c8fcb5343748a604d9ef45d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ClientUser__id$fragmentType: FragmentType;
export type ClientUser__id$data = {
  readonly id: string,
  readonly $fragmentType: ClientUser__id$fragmentType,
};
export type ClientUser__id$key = {
  readonly $data?: ClientUser__id$data,
  readonly $fragmentSpreads: ClientUser__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientUser__id",
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
  "type": "ClientUser",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ClientUser__id$fragmentType,
  ClientUser__id$data,
>*/);
