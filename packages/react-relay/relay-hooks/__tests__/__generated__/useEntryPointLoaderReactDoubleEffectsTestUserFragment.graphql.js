/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fecd077ad1e7b8883288559ccbf12143>>
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
export type useEntryPointLoaderReactDoubleEffectsTestUserFragment$ref = useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType;
export type useEntryPointLoaderReactDoubleEffectsTestUserFragment$data = {|
  +name: ?string,
  +$fragmentType: useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type useEntryPointLoaderReactDoubleEffectsTestUserFragment = useEntryPointLoaderReactDoubleEffectsTestUserFragment$data;
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
  (node/*: any*/).hash = "08959f7be86ca40411ed467ade7e9c26";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useEntryPointLoaderReactDoubleEffectsTestUserFragment$fragmentType,
  useEntryPointLoaderReactDoubleEffectsTestUserFragment$data,
>*/);
