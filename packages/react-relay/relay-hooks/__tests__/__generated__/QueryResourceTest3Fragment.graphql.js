/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2d1ce16ca1fcf9a84d70786f2c437fe6>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest3Fragment$fragmentType: FragmentType;
export type QueryResourceTest3Fragment$data = {
  readonly id: string,
  readonly $fragmentType: QueryResourceTest3Fragment$fragmentType,
};
export type QueryResourceTest3Fragment$key = {
  readonly $data?: QueryResourceTest3Fragment$data,
  readonly $fragmentSpreads: QueryResourceTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest3Fragment",
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
  (node/*:: as any*/).hash = "6a44f17afe34540ffe0084ee7abe4cbf";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  QueryResourceTest3Fragment$fragmentType,
  QueryResourceTest3Fragment$data,
>*/);
