/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<abf3a247aca89fd5eb62347db5928c72>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest2Fragment$ref = RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTest2Fragment$data = {|
  +lastName: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest2Fragment = RelayModernEnvironmentTypeRefinementTest2Fragment$data;
export type RelayModernEnvironmentTypeRefinementTest2Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest2Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
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
  (node/*: any*/).hash = "b238b8d5249ae16a165ca546ff22fd0f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest2Fragment$data,
>*/);
