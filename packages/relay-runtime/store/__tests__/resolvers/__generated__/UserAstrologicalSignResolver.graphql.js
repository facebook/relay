/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<91852b06c533eef327d8112d3f9a0734>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserAstrologicalSignResolver$fragmentType: FragmentType;
export type UserAstrologicalSignResolver$data = {|
  +birthdate: {|
    +day: number,
    +month: number,
  |},
  +$fragmentType: UserAstrologicalSignResolver$fragmentType,
|};
export type UserAstrologicalSignResolver$key = {
  +$data?: UserAstrologicalSignResolver$data,
  +$fragmentSpreads: UserAstrologicalSignResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserAstrologicalSignResolver",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "Date",
        "kind": "LinkedField",
        "name": "birthdate",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "month",
              "storageKey": null
            },
            "action": "THROW",
            "path": "birthdate.month"
          },
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "day",
              "storageKey": null
            },
            "action": "THROW",
            "path": "birthdate.day"
          }
        ],
        "storageKey": null
      },
      "action": "THROW",
      "path": "birthdate"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "35414b48e462693989fdc133253373a5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserAstrologicalSignResolver$fragmentType,
  UserAstrologicalSignResolver$data,
>*/);
