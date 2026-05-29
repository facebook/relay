/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<442cb00c6d893aa3c206fbaaa704d209>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest1Fragment$fragmentType: FragmentType;
export type FragmentResourceTest1Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: FragmentResourceTest1Fragment$fragmentType,
};
export type FragmentResourceTest1Fragment$key = {
  readonly $data?: FragmentResourceTest1Fragment$data,
  readonly $fragmentSpreads: FragmentResourceTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest1Fragment",
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
  (node/*:: as any*/).hash = "f27c5d20e7bb39ee80a8008fdcbe9c3a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  FragmentResourceTest1Fragment$fragmentType,
  FragmentResourceTest1Fragment$data,
>*/);
