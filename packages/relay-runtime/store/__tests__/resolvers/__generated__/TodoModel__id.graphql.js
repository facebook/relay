/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7d9f3bc4473c46e16ae85d22bc971bf8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoModel__id$fragmentType: FragmentType;
export type TodoModel__id$data = {|
  +id: string,
  +$fragmentType: TodoModel__id$fragmentType,
|};
export type TodoModel__id$key = {
  +$data?: TodoModel__id$data,
  +$fragmentSpreads: TodoModel__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoModel__id",
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

module.exports = ((node/*: any*/)/*: Fragment<
  TodoModel__id$fragmentType,
  TodoModel__id$data,
>*/);
