/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b01729305ba069d8ebb5e65edd9fe347>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayFlightRendererTaskTestFragment$fragmentType: FragmentType;
export type RelayFlightRendererTaskTestFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayFlightRendererTaskTestFragment$fragmentType,
|};
export type RelayFlightRendererTaskTestFragment$key = {
  +$data?: RelayFlightRendererTaskTestFragment$data,
  +$fragmentSpreads: RelayFlightRendererTaskTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayFlightRendererTaskTestFragment",
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
  (node/*: any*/).hash = "0a5b832310fa1b717e3bd79c8897504e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayFlightRendererTaskTestFragment$fragmentType,
  RelayFlightRendererTaskTestFragment$data,
>*/);
