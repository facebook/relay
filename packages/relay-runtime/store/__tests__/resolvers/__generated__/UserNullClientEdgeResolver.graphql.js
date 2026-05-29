/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<418f5709307012f449ab6742b67e608f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserNullClientEdgeResolver$fragmentType: FragmentType;
export type UserNullClientEdgeResolver$data = {
  readonly name: ?string,
  readonly $fragmentType: UserNullClientEdgeResolver$fragmentType,
};
export type UserNullClientEdgeResolver$key = {
  readonly $data?: UserNullClientEdgeResolver$data,
  readonly $fragmentSpreads: UserNullClientEdgeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserNullClientEdgeResolver",
  "selections": [
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
  (node/*:: as any*/).hash = "9f879a2d2fff426e606efa7f058d78f5";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserNullClientEdgeResolver$fragmentType,
  UserNullClientEdgeResolver$data,
>*/);
