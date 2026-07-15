/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ee5def231efe2a3172b9b879f538f7d9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ShadowWeakDuoResolver_RootFragment$fragmentType: FragmentType;
export type ShadowWeakDuoResolver_RootFragment$data = {
  readonly me: ?{
    readonly address: ?{
      readonly __typename: "StreetAddress",
      readonly __id: string,
      readonly city: ?string,
    },
  },
  readonly $fragmentType: ShadowWeakDuoResolver_RootFragment$fragmentType,
};
export type ShadowWeakDuoResolver_RootFragment$key = {
  readonly $data?: ShadowWeakDuoResolver_RootFragment$data,
  readonly $fragmentSpreads: ShadowWeakDuoResolver_RootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ShadowWeakDuoResolver_RootFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "StreetAddress",
          "kind": "LinkedField",
          "name": "address",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "city",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            {
              "kind": "ClientExtension",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__id",
                  "storageKey": null
                }
              ]
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "3ccbfe9927ecdb66beccecbd3806bb56";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ShadowWeakDuoResolver_RootFragment$fragmentType,
  ShadowWeakDuoResolver_RootFragment$data,
>*/);
