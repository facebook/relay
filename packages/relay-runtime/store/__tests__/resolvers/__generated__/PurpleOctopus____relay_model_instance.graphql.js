/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c87ff7092ae8948d4ebc194932fcccb7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { PurpleOctopus } from "../PurpleOctopusResolvers.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type PurpleOctopus____relay_model_instance$fragmentType: FragmentType;
export type PurpleOctopus____relay_model_instance$data = {|
  +__relay_model_instance: PurpleOctopus,
  +$fragmentType: PurpleOctopus____relay_model_instance$fragmentType,
|};
export type PurpleOctopus____relay_model_instance$key = {
  +$data?: PurpleOctopus____relay_model_instance$data,
  +$fragmentSpreads: PurpleOctopus____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PurpleOctopus____relay_model_instance",
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
  "type": "PurpleOctopus",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  PurpleOctopus____relay_model_instance$fragmentType,
  PurpleOctopus____relay_model_instance$data,
>*/);
