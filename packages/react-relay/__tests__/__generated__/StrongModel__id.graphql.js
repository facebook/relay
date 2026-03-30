/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d3c9284f5582e7499fc607eb2d46cafa>>
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

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  StrongModel__id$fragmentType,
  StrongModel__id$data,
>*/);
