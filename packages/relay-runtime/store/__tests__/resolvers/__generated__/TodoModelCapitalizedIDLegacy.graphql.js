/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<31262a678a0d41483877e039fb2d6c22>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoModelCapitalizedIDLegacy$fragmentType: FragmentType;
export type TodoModelCapitalizedIDLegacy$data = {|
  +id: string,
  +$fragmentType: TodoModelCapitalizedIDLegacy$fragmentType,
|};
export type TodoModelCapitalizedIDLegacy$key = {
  +$data?: TodoModelCapitalizedIDLegacy$data,
  +$fragmentSpreads: TodoModelCapitalizedIDLegacy$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoModelCapitalizedIDLegacy",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "TodoModel",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "77e5adaeb6123b858f391b8f3442675c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  TodoModelCapitalizedIDLegacy$fragmentType,
  TodoModelCapitalizedIDLegacy$data,
>*/);
