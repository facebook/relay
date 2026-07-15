/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f41cb4cf7b0ec8d5776abbc9faead593>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ShadowWeakBeta } from "../ShadowWeakBetaResolvers.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type ShadowWeakBeta____relay_model_instance$fragmentType: FragmentType;
export type ShadowWeakBeta____relay_model_instance$data = {
  readonly __relay_model_instance: ShadowWeakBeta,
  readonly $fragmentType: ShadowWeakBeta____relay_model_instance$fragmentType,
};
export type ShadowWeakBeta____relay_model_instance$key = {
  readonly $data?: ShadowWeakBeta____relay_model_instance$data,
  readonly $fragmentSpreads: ShadowWeakBeta____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ShadowWeakBeta____relay_model_instance",
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
  "type": "ShadowWeakBeta",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ShadowWeakBeta____relay_model_instance$fragmentType,
  ShadowWeakBeta____relay_model_instance$data,
>*/);
