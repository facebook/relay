/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5bb82740637ead58fafb450bcd5f09ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { Octopus } from "../OctopusResolvers.js";
import type { FragmentType } from "relay-runtime";
declare export opaque type Octopus____relay_model_instance$fragmentType: FragmentType;
export type Octopus____relay_model_instance$data = {|
  +__relay_model_instance: Octopus,
  +$fragmentType: Octopus____relay_model_instance$fragmentType,
|};
export type Octopus____relay_model_instance$key = {
  +$data?: Octopus____relay_model_instance$data,
  +$fragmentSpreads: Octopus____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Octopus____relay_model_instance",
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
  "type": "Octopus",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  Octopus____relay_model_instance$fragmentType,
  Octopus____relay_model_instance$data,
>*/);
