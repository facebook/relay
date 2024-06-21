/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fee9ab0d6e344059cf2c0d173656d54e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoDescriptionStyle } from "../TodoDescription.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoDescriptionStyle____relay_model_instance$fragmentType: FragmentType;
export type TodoDescriptionStyle____relay_model_instance$data = {|
  +__relay_model_instance: TodoDescriptionStyle,
  +$fragmentType: TodoDescriptionStyle____relay_model_instance$fragmentType,
|};
export type TodoDescriptionStyle____relay_model_instance$key = {
  +$data?: TodoDescriptionStyle____relay_model_instance$data,
  +$fragmentSpreads: TodoDescriptionStyle____relay_model_instance$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  TodoDescriptionStyle____relay_model_instance$fragmentType,
  TodoDescriptionStyle____relay_model_instance$data,
>*/);
