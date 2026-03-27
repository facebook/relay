/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bc13a3cb0044b9285881857f6337de02>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type StrongModel__id$fragmentType: FragmentType;
export type StrongModel__id$data = {|
  +id: string,
  +$fragmentType: StrongModel__id$fragmentType,
|};
export type StrongModel__id$key = {
  +$data?: StrongModel__id$data,
  +$fragmentSpreads: StrongModel__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StrongModel__id",
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
  "type": "StrongModel",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  StrongModel__id$fragmentType,
  StrongModel__id$data,
>*/);
