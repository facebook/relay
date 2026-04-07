/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cab55778d7a6d1e436cc86a8d2c5a6d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserNullClientEdgeResolver$fragmentType: FragmentType;
export type UserNullClientEdgeResolver$data = {|
  +name: ?string,
  +$fragmentType: UserNullClientEdgeResolver$fragmentType,
|};
export type UserNullClientEdgeResolver$key = {
  +$data?: UserNullClientEdgeResolver$data,
  +$fragmentSpreads: UserNullClientEdgeResolver$fragmentType,
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
