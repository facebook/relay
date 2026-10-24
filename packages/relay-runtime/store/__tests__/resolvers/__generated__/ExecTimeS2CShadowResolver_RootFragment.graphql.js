/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<769e0bbbb7b14f592ffc0b484c2a9082>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ExecTimeS2CShadowResolver_RootFragment$fragmentType: FragmentType;
export type ExecTimeS2CShadowResolver_RootFragment$data = {
  readonly me: ?{
    readonly address: ?{
      readonly __typename: "StreetAddress",
      readonly __id: string,
    },
  },
  readonly $fragmentType: ExecTimeS2CShadowResolver_RootFragment$fragmentType,
};
export type ExecTimeS2CShadowResolver_RootFragment$key = {
  readonly $data?: ExecTimeS2CShadowResolver_RootFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CShadowResolver_RootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CShadowResolver_RootFragment",
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
  (node/*:: as any*/).hash = "950cda645df92ec50c61d922c4cf7a05";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CShadowResolver_RootFragment$fragmentType,
  ExecTimeS2CShadowResolver_RootFragment$data,
>*/);
