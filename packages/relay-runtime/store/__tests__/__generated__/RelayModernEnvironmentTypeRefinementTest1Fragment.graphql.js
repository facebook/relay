/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<53b9424879fd18eeec8bbdf3fa44aa6e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest2Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest1Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest1Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest1Fragment = {|
  +id: string,
  +name: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest2Fragment$ref,
  +$refType: RelayModernEnvironmentTypeRefinementTest1Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest1Fragment$data = RelayModernEnvironmentTypeRefinementTest1Fragment;
export type RelayModernEnvironmentTypeRefinementTest1Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest1Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernEnvironmentTypeRefinementTest2Fragment"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "56d8bec2588a9c75f03cb4774ab016e6";
}

module.exports = node;
