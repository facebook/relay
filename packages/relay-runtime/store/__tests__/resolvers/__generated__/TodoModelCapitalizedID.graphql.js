/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8560e5228aa392e8a499147a4649ee70>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoModelCapitalizedID$fragmentType: FragmentType;
export type TodoModelCapitalizedID$data = {|
  +id: string,
  +$fragmentType: TodoModelCapitalizedID$fragmentType,
|};
export type TodoModelCapitalizedID$key = {
  +$data?: TodoModelCapitalizedID$data,
  +$fragmentSpreads: TodoModelCapitalizedID$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoModelCapitalizedID",
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
  (node/*: any*/).hash = "3ccdcd3cdec1ef56528d736c7f311176";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoModelCapitalizedID$fragmentType,
  TodoModelCapitalizedID$data,
>*/);
