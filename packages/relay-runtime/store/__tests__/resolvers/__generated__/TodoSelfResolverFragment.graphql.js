/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4b174066ba6c9e45b37a14ff57c55ec4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoSelfResolverFragment$fragmentType: FragmentType;
export type TodoSelfResolverFragment$data = {|
  +todo_id: string,
  +$fragmentType: TodoSelfResolverFragment$fragmentType,
|};
export type TodoSelfResolverFragment$key = {
  +$data?: TodoSelfResolverFragment$data,
  +$fragmentSpreads: TodoSelfResolverFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoSelfResolverFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "todo_id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Todo",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f249ac02d6f0f54d64db9d7c57d028bf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoSelfResolverFragment$fragmentType,
  TodoSelfResolverFragment$data,
>*/);
