/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4e5915390c449d30100ebc5f6fec11f5>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserClientEdgeResolver$fragmentType: FragmentType;
export type UserClientEdgeResolver$data = {
  readonly name: ?string,
  readonly $fragmentType: UserClientEdgeResolver$fragmentType,
};
export type UserClientEdgeResolver$key = {
  readonly $data?: UserClientEdgeResolver$data,
  readonly $fragmentSpreads: UserClientEdgeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserClientEdgeResolver",
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
  (node/*:: as any*/).hash = "229602ceb28357007afbf2ef87e3720b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserClientEdgeResolver$fragmentType,
  UserClientEdgeResolver$data,
>*/);
