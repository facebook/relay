/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b3a42fa48586760d06c1d23c16c62c98>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type AstrologicalSignSelfResolver$fragmentType: FragmentType;
export type AstrologicalSignSelfResolver$data = {
  readonly id: string,
  readonly $fragmentType: AstrologicalSignSelfResolver$fragmentType,
};
export type AstrologicalSignSelfResolver$key = {
  readonly $data?: AstrologicalSignSelfResolver$data,
  readonly $fragmentSpreads: AstrologicalSignSelfResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AstrologicalSignSelfResolver",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "RequiredField",
          "field": {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          "action": "THROW"
        }
      ]
    }
  ],
  "type": "AstrologicalSign",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "74a38e68f3b424a003615942ca82e107";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  AstrologicalSignSelfResolver$fragmentType,
  AstrologicalSignSelfResolver$data,
>*/);
