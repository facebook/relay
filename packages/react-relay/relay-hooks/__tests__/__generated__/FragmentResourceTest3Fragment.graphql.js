/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d4c7f95229336cc6e8dde3be828e052f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest3Fragment$fragmentType: FragmentType;
export type FragmentResourceTest3Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +$fragmentType: FragmentResourceTest3Fragment$fragmentType,
|}>;
export type FragmentResourceTest3Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest3Fragment$data,
  +$fragmentSpreads: FragmentResourceTest3Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "2e6d446b0d37a086b0c6598bcbc72ccf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest3Fragment$fragmentType,
  FragmentResourceTest3Fragment$data,
>*/);
