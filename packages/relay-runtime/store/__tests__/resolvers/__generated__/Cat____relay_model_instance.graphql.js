/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8e0341bf38ecf7a722ac413f3e30a062>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { Cat__id$data } from "./Cat__id.graphql";
import type { FragmentType } from "relay-runtime";
import {Cat as catRelayModelInstanceResolverType} from "../CatResolvers.js";
// Type assertion validating that `catRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(catRelayModelInstanceResolverType: (
  id: Cat__id$data['id'],
) => mixed);
declare export opaque type Cat____relay_model_instance$fragmentType: FragmentType;
export type Cat____relay_model_instance$data = {|
  +__relay_model_instance: $NonMaybeType<ReturnType<typeof catRelayModelInstanceResolverType>>,
  +$fragmentType: Cat____relay_model_instance$fragmentType,
|};
export type Cat____relay_model_instance$key = {
  +$data?: Cat____relay_model_instance$data,
  +$fragmentSpreads: Cat____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Cat____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "Cat__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Cat__id.graphql'), require('./../CatResolvers').Cat, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "Cat",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  Cat____relay_model_instance$fragmentType,
  Cat____relay_model_instance$data,
>*/);
