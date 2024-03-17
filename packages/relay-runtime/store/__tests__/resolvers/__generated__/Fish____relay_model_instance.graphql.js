/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<983a328272b83e497c1b84088fee56fd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { Fish__id$data } from "./Fish__id.graphql";
import type { FragmentType } from "relay-runtime";
import {Fish as fishRelayModelInstanceResolverType} from "../FishResolvers.js";
// Type assertion validating that `fishRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(fishRelayModelInstanceResolverType: (
  id: Fish__id$data['id'],
) => mixed);
declare export opaque type Fish____relay_model_instance$fragmentType: FragmentType;
export type Fish____relay_model_instance$data = {|
  +__relay_model_instance: ?ReturnType<typeof fishRelayModelInstanceResolverType>,
  +$fragmentType: Fish____relay_model_instance$fragmentType,
|};
export type Fish____relay_model_instance$key = {
  +$data?: Fish____relay_model_instance$data,
  +$fragmentSpreads: Fish____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Fish____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "Fish__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Fish__id.graphql'), require('./../FishResolvers').Fish, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "Fish",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  Fish____relay_model_instance$fragmentType,
  Fish____relay_model_instance$data,
>*/);
