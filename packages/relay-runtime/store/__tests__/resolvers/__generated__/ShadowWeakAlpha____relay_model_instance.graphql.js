/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b3bbfbb94cd2421fa6edff588e0c2d15>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ShadowWeakAlpha } from "../ShadowWeakAlphaResolvers.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type ShadowWeakAlpha____relay_model_instance$fragmentType: FragmentType;
export type ShadowWeakAlpha____relay_model_instance$data = {
  readonly __relay_model_instance: ShadowWeakAlpha,
  readonly $fragmentType: ShadowWeakAlpha____relay_model_instance$fragmentType,
};
export type ShadowWeakAlpha____relay_model_instance$key = {
  readonly $data?: ShadowWeakAlpha____relay_model_instance$data,
  readonly $fragmentSpreads: ShadowWeakAlpha____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ShadowWeakAlpha____relay_model_instance",
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
  "type": "ShadowWeakAlpha",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ShadowWeakAlpha____relay_model_instance$fragmentType,
  ShadowWeakAlpha____relay_model_instance$data,
>*/);
