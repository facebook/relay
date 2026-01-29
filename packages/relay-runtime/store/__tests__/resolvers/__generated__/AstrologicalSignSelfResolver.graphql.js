/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e352df08fa7ab4a32c0625b60d420b16>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type AstrologicalSignSelfResolver$fragmentType: FragmentType;
export type AstrologicalSignSelfResolver$data = {|
  +id: string,
  +$fragmentType: AstrologicalSignSelfResolver$fragmentType,
|};
export type AstrologicalSignSelfResolver$key = {
  +$data?: AstrologicalSignSelfResolver$data,
  +$fragmentSpreads: AstrologicalSignSelfResolver$fragmentType,
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
  (node/*: any*/).hash = "74a38e68f3b424a003615942ca82e107";
}

module.exports = ((node/*: any*/)/*: Fragment<
  AstrologicalSignSelfResolver$fragmentType,
  AstrologicalSignSelfResolver$data,
>*/);
