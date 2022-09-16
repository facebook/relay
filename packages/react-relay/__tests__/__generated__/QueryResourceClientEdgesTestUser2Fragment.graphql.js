/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4f02e34af4d3c22e422da9f4915f8aed>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceClientEdgesTestUser2Fragment$fragmentType: FragmentType;
export type QueryResourceClientEdgesTestUser2Fragment$data = {|
  +alternate_name: ?string,
  +$fragmentType: QueryResourceClientEdgesTestUser2Fragment$fragmentType,
|};
export type QueryResourceClientEdgesTestUser2Fragment$key = {
  +$data?: QueryResourceClientEdgesTestUser2Fragment$data,
  +$fragmentSpreads: QueryResourceClientEdgesTestUser2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceClientEdgesTestUser2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "alternate_name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e2a0ee274af865a1e59eb33a576f2640";
}

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceClientEdgesTestUser2Fragment$fragmentType,
  QueryResourceClientEdgesTestUser2Fragment$data,
>*/);
