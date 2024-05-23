/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e05bd56ab2b5c41d7ee9186edfcb3aa0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceSemanticNonNullTestFragment1$fragmentType: FragmentType;
export type FragmentResourceSemanticNonNullTestFragment1$data = {|
  +name: ?string,
  +$fragmentType: FragmentResourceSemanticNonNullTestFragment1$fragmentType,
|};
export type FragmentResourceSemanticNonNullTestFragment1$key = {
  +$data?: FragmentResourceSemanticNonNullTestFragment1$data,
  +$fragmentSpreads: FragmentResourceSemanticNonNullTestFragment1$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "FragmentResourceSemanticNonNullTestFragment1",
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
  (node/*: any*/).hash = "1a78814fdaf60c7ab1bc0f62142f256d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceSemanticNonNullTestFragment1$fragmentType,
  FragmentResourceSemanticNonNullTestFragment1$data,
>*/);
