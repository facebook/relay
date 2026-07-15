/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4d8502b2be0576cc928c29a6318d299d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest6Fragment$fragmentType: FragmentType;
export type FragmentResourceTest6Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: FragmentResourceTest6Fragment$fragmentType,
};
export type FragmentResourceTest6Fragment$key = {
  readonly $data?: FragmentResourceTest6Fragment$data,
  readonly $fragmentSpreads: FragmentResourceTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest6Fragment",
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
  (node/*:: as any*/).hash = "26deeac9ed39ae31bf668919ae1ed5ad";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  FragmentResourceTest6Fragment$fragmentType,
  FragmentResourceTest6Fragment$data,
>*/);
