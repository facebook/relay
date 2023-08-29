/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4a997196caa00ab4c98a5513071ceedc>>
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
declare export opaque type tests_TodoDescription____relay_model_instance$fragmentType: FragmentType;
export type tests_TodoDescription____relay_model_instance$data = {|
  +__relay_model_instance: TodoDescription,
  +$fragmentType: tests_TodoDescription____relay_model_instance$fragmentType,
|};
export type tests_TodoDescription____relay_model_instance$key = {
  +$data?: tests_TodoDescription____relay_model_instance$data,
  +$fragmentSpreads: tests_TodoDescription____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "tests_TodoDescription____relay_model_instance",
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
  tests_TodoDescription____relay_model_instance$fragmentType,
  tests_TodoDescription____relay_model_instance$data,
>*/);
