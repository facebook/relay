/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<306183576aedf34dda8aadc7a7bf25b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest3Fragment$ref = RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTest3Fragment$data = {|
  +id: string,
  +lastName: ?string,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest3Fragment = RelayModernEnvironmentTypeRefinementTest3Fragment$data;
export type RelayModernEnvironmentTypeRefinementTest3Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest3Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest3Fragment$data,
>*/);
