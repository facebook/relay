/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<26ccacfe1130a9999a314bf6e7e760ef>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ErrorModel__id$fragmentType: FragmentType;
export type ErrorModel__id$data = {|
  +id: string,
  +$fragmentType: ErrorModel__id$fragmentType,
|};
export type ErrorModel__id$key = {
  +$data?: ErrorModel__id$data,
  +$fragmentSpreads: ErrorModel__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ErrorModel__id",
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
  "type": "ErrorModel",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ErrorModel__id$fragmentType,
  ErrorModel__id$data,
>*/);
