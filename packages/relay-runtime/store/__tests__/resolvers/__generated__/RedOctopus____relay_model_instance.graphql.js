/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<751fc00d0d418c2e811a86dc7eed794a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RedOctopus } from "../RedOctopusResolvers.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type RedOctopus____relay_model_instance$fragmentType: FragmentType;
export type RedOctopus____relay_model_instance$data = {|
  +__relay_model_instance: RedOctopus,
  +$fragmentType: RedOctopus____relay_model_instance$fragmentType,
|};
export type RedOctopus____relay_model_instance$key = {
  +$data?: RedOctopus____relay_model_instance$data,
  +$fragmentSpreads: RedOctopus____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RedOctopus____relay_model_instance",
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
  "type": "RedOctopus",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  RedOctopus____relay_model_instance$fragmentType,
  RedOctopus____relay_model_instance$data,
>*/);
