/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a280019227672d13ba90b69cd56a8e36>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest8Fragment$fragmentType: FragmentType;
export type FragmentResourceTest8Fragment$data = ReadonlyArray<{|
  +id: string,
  +$fragmentType: FragmentResourceTest8Fragment$fragmentType,
|}>;
export type FragmentResourceTest8Fragment$key = ReadonlyArray<{
  +$data?: FragmentResourceTest8Fragment$data,
  +$fragmentSpreads: FragmentResourceTest8Fragment$fragmentType,
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
  (node/*: any*/).hash = "3659df213e80c235900fa14741c7dc8f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest8Fragment$fragmentType,
  FragmentResourceTest8Fragment$data,
>*/);
