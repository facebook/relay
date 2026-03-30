/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8b4f724f35aa6eabc763733674fc04a7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserClientEdgeResolver$fragmentType: FragmentType;
export type UserClientEdgeResolver$data = {|
  +name: ?string,
  +$fragmentType: UserClientEdgeResolver$fragmentType,
|};
export type UserClientEdgeResolver$key = {
  +$data?: UserClientEdgeResolver$data,
  +$fragmentSpreads: UserClientEdgeResolver$fragmentType,
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
