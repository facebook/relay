/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87eafbdb3974dff26a13d0823be8fc7a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverTestUtilsFlowTest$fragmentType: FragmentType;
export type RelayResolverTestUtilsFlowTest$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayResolverTestUtilsFlowTest$fragmentType,
};
export type RelayResolverTestUtilsFlowTest$key = {
  readonly $data?: RelayResolverTestUtilsFlowTest$data,
  readonly $fragmentSpreads: RelayResolverTestUtilsFlowTest$fragmentType,
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
  (node/*:: as any*/).hash = "f3f6718b7cf618c97293b5882ccc96c0";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResolverTestUtilsFlowTest$fragmentType,
  RelayResolverTestUtilsFlowTest$data,
>*/);
