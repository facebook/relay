/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4f3dc18e2304d1160ced31eb7ef1d2d1>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserNamePassthroughResolver$fragmentType: FragmentType;
export type UserNamePassthroughResolver$data = {|
  +name: ?string,
  +$fragmentType: UserNamePassthroughResolver$fragmentType,
|};
export type UserNamePassthroughResolver$key = {
  +$data?: UserNamePassthroughResolver$data,
  +$fragmentSpreads: UserNamePassthroughResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserNamePassthroughResolver",
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
  (node/*:: as any*/).hash = "20f4b2292389542807da6cc6d7711e99";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserNamePassthroughResolver$fragmentType,
  UserNamePassthroughResolver$data,
>*/);
