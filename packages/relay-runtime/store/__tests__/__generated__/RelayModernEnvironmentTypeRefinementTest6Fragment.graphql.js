/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7170f6282418a441e93f1b969ff8866b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest6Fragment$ref = RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTest6Fragment$data = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest6Fragment = RelayModernEnvironmentTypeRefinementTest6Fragment$data;
export type RelayModernEnvironmentTypeRefinementTest6Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest6Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
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
  (node/*: any*/).hash = "56861ad3b4a9af275e12050dc98488c6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest6Fragment$data,
>*/);
