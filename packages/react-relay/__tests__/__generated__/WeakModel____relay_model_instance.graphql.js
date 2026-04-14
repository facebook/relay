/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8abd366cc7c1b3b5921a9c54c313d539>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { WeakModel } from "../RelayResolverNullableModelClientEdge-test.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type WeakModel____relay_model_instance$fragmentType: FragmentType;
export type WeakModel____relay_model_instance$data = {|
  +__relay_model_instance: WeakModel,
  +$fragmentType: WeakModel____relay_model_instance$fragmentType,
|};
export type WeakModel____relay_model_instance$key = {
  +$data?: WeakModel____relay_model_instance$data,
  +$fragmentSpreads: WeakModel____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "WeakModel____relay_model_instance",
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
  "type": "WeakModel",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  WeakModel____relay_model_instance$fragmentType,
  WeakModel____relay_model_instance$data,
>*/);
