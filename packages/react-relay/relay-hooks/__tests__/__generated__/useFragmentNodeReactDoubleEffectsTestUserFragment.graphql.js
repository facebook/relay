/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<030281e8f00d5b2a17648a2811e26d9e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType: FragmentType;
export type useFragmentNodeReactDoubleEffectsTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType,
|};
export type useFragmentNodeReactDoubleEffectsTestUserFragment$key = {
  +$data?: useFragmentNodeReactDoubleEffectsTestUserFragment$data,
  +$fragmentSpreads: useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentNodeReactDoubleEffectsTestUserFragment",
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "c5a3cbb897157399807b77d5584a1c51";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType,
  useFragmentNodeReactDoubleEffectsTestUserFragment$data,
>*/);
