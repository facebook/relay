/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3a51c19e003ab8b1c3e8d19d7e91c356>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useFragmentNodeReactDoubleEffectsTestUserFragment$ref: FragmentReference;
declare export opaque type useFragmentNodeReactDoubleEffectsTestUserFragment$fragmentType: useFragmentNodeReactDoubleEffectsTestUserFragment$ref;
export type useFragmentNodeReactDoubleEffectsTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: useFragmentNodeReactDoubleEffectsTestUserFragment$ref,
|};
export type useFragmentNodeReactDoubleEffectsTestUserFragment$data = useFragmentNodeReactDoubleEffectsTestUserFragment;
export type useFragmentNodeReactDoubleEffectsTestUserFragment$key = {
  +$data?: useFragmentNodeReactDoubleEffectsTestUserFragment$data,
  +$fragmentRefs: useFragmentNodeReactDoubleEffectsTestUserFragment$ref,
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

module.exports = node;
