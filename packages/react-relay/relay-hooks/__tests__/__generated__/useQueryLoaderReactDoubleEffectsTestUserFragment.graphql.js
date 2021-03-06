/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fb7b9e8454719e08080b51ed5f65aa09>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useQueryLoaderReactDoubleEffectsTestUserFragment$ref: FragmentReference;
declare export opaque type useQueryLoaderReactDoubleEffectsTestUserFragment$fragmentType: useQueryLoaderReactDoubleEffectsTestUserFragment$ref;
export type useQueryLoaderReactDoubleEffectsTestUserFragment = {|
  +name: ?string,
  +$refType: useQueryLoaderReactDoubleEffectsTestUserFragment$ref,
|};
export type useQueryLoaderReactDoubleEffectsTestUserFragment$data = useQueryLoaderReactDoubleEffectsTestUserFragment;
export type useQueryLoaderReactDoubleEffectsTestUserFragment$key = {
  +$data?: useQueryLoaderReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: useQueryLoaderReactDoubleEffectsTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useQueryLoaderReactDoubleEffectsTestUserFragment",
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
  (node/*: any*/).hash = "72c07efb1c002b4aee506ebf63936270";
}

module.exports = node;
