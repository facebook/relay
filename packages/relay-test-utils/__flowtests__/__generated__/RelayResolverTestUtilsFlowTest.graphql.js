/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b2df9bec5e4772670acec1e14d2c12da>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverTestUtilsFlowTest$fragmentType: FragmentType;
export type RelayResolverTestUtilsFlowTest$data = {|
  +name: ?string,
  +$fragmentType: RelayResolverTestUtilsFlowTest$fragmentType,
|};
export type RelayResolverTestUtilsFlowTest$key = {
  +$data?: RelayResolverTestUtilsFlowTest$data,
  +$fragmentSpreads: RelayResolverTestUtilsFlowTest$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverTestUtilsFlowTest",
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
  (node/*: any*/).hash = "f3f6718b7cf618c97293b5882ccc96c0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverTestUtilsFlowTest$fragmentType,
  RelayResolverTestUtilsFlowTest$data,
>*/);
