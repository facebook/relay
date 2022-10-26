/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<012ce1e7629cf9b55453b8a902b29fe5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceClientEdgesTestUser1Fragment$fragmentType: FragmentType;
export type QueryResourceClientEdgesTestUser1Fragment$data = {|
  +actorCount: ?number,
  +$fragmentType: QueryResourceClientEdgesTestUser1Fragment$fragmentType,
|};
export type QueryResourceClientEdgesTestUser1Fragment$key = {
  +$data?: QueryResourceClientEdgesTestUser1Fragment$data,
  +$fragmentSpreads: QueryResourceClientEdgesTestUser1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceClientEdgesTestUser1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "actorCount",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "66916012bfcbee2d7f16f4e4f4d3b71c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceClientEdgesTestUser1Fragment$fragmentType,
  QueryResourceClientEdgesTestUser1Fragment$data,
>*/);
