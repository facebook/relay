/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84d238ae55719f542ce2c5a345ebde30>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest6Fragment$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest6Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest6Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Named",
  "abstractKey": "__isNamed"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "56861ad3b4a9af275e12050dc98488c6";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest6Fragment$data,
>*/);
