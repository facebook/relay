/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0ce28a8b06fa952a2eb8269c6e1d2257>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest8Fragment$fragmentType: FragmentType;
export type FragmentResourceTest8Fragment$data = ReadonlyArray<{
  readonly id: string,
  readonly $fragmentType: FragmentResourceTest8Fragment$fragmentType,
}>;
export type FragmentResourceTest8Fragment$key = ReadonlyArray<{
  readonly $data?: FragmentResourceTest8Fragment$data,
  readonly $fragmentSpreads: FragmentResourceTest8Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceTest8Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "3659df213e80c235900fa14741c7dc8f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  FragmentResourceTest8Fragment$fragmentType,
  FragmentResourceTest8Fragment$data,
>*/);
