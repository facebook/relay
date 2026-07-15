/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f05ec35afc9df80be1ee6e30e0d965f2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoDescriptionStyle } from "../TodoDescription.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoDescriptionStyle____relay_model_instance$fragmentType: FragmentType;
export type TodoDescriptionStyle____relay_model_instance$data = {
  readonly __relay_model_instance: TodoDescriptionStyle,
  readonly $fragmentType: TodoDescriptionStyle____relay_model_instance$fragmentType,
};
export type TodoDescriptionStyle____relay_model_instance$key = {
  readonly $data?: TodoDescriptionStyle____relay_model_instance$data,
  readonly $fragmentSpreads: TodoDescriptionStyle____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoDescriptionStyle____relay_model_instance",
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
  "type": "TodoDescriptionStyle",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  TodoDescriptionStyle____relay_model_instance$fragmentType,
  TodoDescriptionStyle____relay_model_instance$data,
>*/);
