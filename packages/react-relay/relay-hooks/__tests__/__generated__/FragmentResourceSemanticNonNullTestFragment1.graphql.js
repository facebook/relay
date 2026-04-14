/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<92cbc9cc22a57a9cebdc774c24737c47>>
 * @flow
 * @lightSyntaxTransform
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
  (node/*:: as any*/).hash = "1a78814fdaf60c7ab1bc0f62142f256d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  FragmentResourceSemanticNonNullTestFragment1$fragmentType,
  FragmentResourceSemanticNonNullTestFragment1$data,
>*/);
