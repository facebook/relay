/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<16891e4aff9615b40f26e280e5a603b4>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserAstrologicalSignResolver$fragmentType: FragmentType;
export type UserAstrologicalSignResolver$data = {
  readonly birthdate: {
    readonly day: number,
    readonly month: number,
  },
  readonly $fragmentType: UserAstrologicalSignResolver$fragmentType,
};
export type UserAstrologicalSignResolver$key = {
  readonly $data?: UserAstrologicalSignResolver$data,
  readonly $fragmentSpreads: UserAstrologicalSignResolver$fragmentType,
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
            "action": "THROW"
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
            "action": "THROW"
          }
        ],
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "35414b48e462693989fdc133253373a5";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserAstrologicalSignResolver$fragmentType,
  UserAstrologicalSignResolver$data,
>*/);
