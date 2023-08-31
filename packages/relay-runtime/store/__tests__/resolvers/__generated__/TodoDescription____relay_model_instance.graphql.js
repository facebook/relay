/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a657f77bb6c676eb5b9b7078cb2533e2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoDescription } from "../TodoDescription.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoDescription____relay_model_instance$fragmentType: FragmentType;
export type TodoDescription____relay_model_instance$data = {|
  +__relay_model_instance: TodoDescription,
  +$fragmentType: TodoDescription____relay_model_instance$fragmentType,
|};
export type TodoDescription____relay_model_instance$key = {
  +$data?: TodoDescription____relay_model_instance$data,
  +$fragmentSpreads: TodoDescription____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoDescription____relay_model_instance",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__relay_model_instance",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "TodoDescription",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  TodoDescription____relay_model_instance$fragmentType,
  TodoDescription____relay_model_instance$data,
>*/);
