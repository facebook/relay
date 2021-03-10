/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aaff0d55148da31f6756b5a1c2ea7ffc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest10Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest9Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest9Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest9Fragment = {|
  +id: string,
  +lastName: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest10Fragment$ref,
  +$refType: RelayModernEnvironmentTypeRefinementTest9Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest9Fragment$data = RelayModernEnvironmentTypeRefinementTest9Fragment;
export type RelayModernEnvironmentTypeRefinementTest9Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest9Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest9Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest9Fragment",
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
      "name": "RelayModernEnvironmentTypeRefinementTest10Fragment"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "7006df6bd31b24b2a89e742500e6165a";
}

module.exports = node;
