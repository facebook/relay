/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f4b5ca06071e1e3365a534dca9e23503>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest2Fragment$data = {
  readonly lastName: ?string,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest2Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest2Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "b238b8d5249ae16a165ca546ff22fd0f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest2Fragment$data,
>*/);
