/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fa019812e19718ee99f2b0d967aa984b>>
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

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  TodoModel__id$fragmentType,
  TodoModel__id$data,
>*/);
