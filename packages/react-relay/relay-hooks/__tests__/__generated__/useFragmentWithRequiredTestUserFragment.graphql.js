/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<875d82da0d0ec258e9fbadb89988c342>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentWithRequiredTestUserFragment$fragmentType: FragmentType;
export type useFragmentWithRequiredTestUserFragment$data = ?{|
  +name: string,
  +$fragmentType: useFragmentWithRequiredTestUserFragment$fragmentType,
|};
export type useFragmentWithRequiredTestUserFragment$key = {
  +$data?: useFragmentWithRequiredTestUserFragment$data,
  +$fragmentSpreads: useFragmentWithRequiredTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentWithRequiredTestUserFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "LOG"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "9e3297104a693133e2546618d76ce8d8";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentWithRequiredTestUserFragment$fragmentType,
  useFragmentWithRequiredTestUserFragment$data,
>*/);
