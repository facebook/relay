/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4996a7e1f2d3176c63f816fb09a7a29b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { BaseCounter } from "../LiveCounterContextResolver.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type BaseCounter____relay_model_instance$fragmentType: FragmentType;
export type BaseCounter____relay_model_instance$data = {
  readonly __relay_model_instance: BaseCounter,
  readonly $fragmentType: BaseCounter____relay_model_instance$fragmentType,
};
export type BaseCounter____relay_model_instance$key = {
  readonly $data?: BaseCounter____relay_model_instance$data,
  readonly $fragmentSpreads: BaseCounter____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BaseCounter____relay_model_instance",
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
  "type": "BaseCounter",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  BaseCounter____relay_model_instance$fragmentType,
  BaseCounter____relay_model_instance$data,
>*/);
