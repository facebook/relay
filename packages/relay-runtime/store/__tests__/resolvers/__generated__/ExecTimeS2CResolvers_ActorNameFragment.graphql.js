/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2eb8784ca21cd4191dacf783f59e5f43>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ExecTimeS2CResolvers_ActorNameFragment$fragmentType: FragmentType;
export type ExecTimeS2CResolvers_ActorNameFragment$data = {
  readonly id: string,
  readonly name?: ?string,
  readonly $fragmentType: ExecTimeS2CResolvers_ActorNameFragment$fragmentType,
};
export type ExecTimeS2CResolvers_ActorNameFragment$key = {
  readonly $data?: ExecTimeS2CResolvers_ActorNameFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CResolvers_ActorNameFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CResolvers_ActorNameFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "Actor",
      "abstractKey": "__isActor"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "a7a16765a11b758d4aa322974a836a91";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CResolvers_ActorNameFragment$fragmentType,
  ExecTimeS2CResolvers_ActorNameFragment$data,
>*/);
