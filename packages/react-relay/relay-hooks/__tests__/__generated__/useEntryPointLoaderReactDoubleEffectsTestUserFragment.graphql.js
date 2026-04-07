/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<abe2a617834ce023abdf32efeed516e5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType: FragmentType;
export type useEntryPointLoaderReactDoubleEffectsTestUserFragment$data = {|
  +name: ?string,
  +$fragmentType: useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type useEntryPointLoaderReactDoubleEffectsTestUserFragment$key = {
  +$data?: useEntryPointLoaderReactDoubleEffectsTestUserFragment$data,
  +$fragmentSpreads: useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useEntryPointLoaderReactDoubleEffectsTestUserFragment",
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
  (node/*:: as any*/).hash = "08959f7be86ca40411ed467ade7e9c26";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
  useEntryPointLoaderReactDoubleEffectsTestUserFragment$data,
>*/);
