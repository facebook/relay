/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a5672a23b4e3e05425874083a60a120f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest9Fragment$ref = RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTest9Fragment$data = {|
  +id: string,
  +lastName: ?string,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest9Fragment = RelayModernEnvironmentTypeRefinementTest9Fragment$data;
export type RelayModernEnvironmentTypeRefinementTest9Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest9Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest9Fragment$data,
>*/);
