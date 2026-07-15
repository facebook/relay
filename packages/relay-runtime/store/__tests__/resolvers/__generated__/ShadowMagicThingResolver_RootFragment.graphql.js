/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d2b05b422c311e28b546ec19f802670>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ShadowMagicThingResolver_RootFragment$fragmentType: FragmentType;
export type ShadowMagicThingResolver_RootFragment$data = {
  readonly me: ?{
    readonly address: ?{
      readonly __typename: "StreetAddress",
      readonly __id: string,
      readonly city: ?string,
    },
  },
  readonly $fragmentType: ShadowMagicThingResolver_RootFragment$fragmentType,
};
export type ShadowMagicThingResolver_RootFragment$key = {
  readonly $data?: ShadowMagicThingResolver_RootFragment$data,
  readonly $fragmentSpreads: ShadowMagicThingResolver_RootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ShadowMagicThingResolver_RootFragment",
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
  (node/*:: as any*/).hash = "477665cee30d2ad154932ea0085eb42e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ShadowMagicThingResolver_RootFragment$fragmentType,
  ShadowMagicThingResolver_RootFragment$data,
>*/);
