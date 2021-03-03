/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<16dd5e19494a4227245329eab27fa780>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest4Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest3Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest3Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest3Fragment = {|
  +id: string,
  +lastName: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest4Fragment$ref,
  +$refType: RelayModernEnvironmentTypeRefinementTest3Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest3Fragment$data = RelayModernEnvironmentTypeRefinementTest3Fragment;
export type RelayModernEnvironmentTypeRefinementTest3Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest3Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest3Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest3Fragment",
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
      "name": "lastName",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernEnvironmentTypeRefinementTest4Fragment"
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f0bb895c71278e149eba4c305ca1cfcf";
}

module.exports = node;
