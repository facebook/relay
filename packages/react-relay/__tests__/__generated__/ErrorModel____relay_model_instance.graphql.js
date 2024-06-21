/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cb67e192fc8cfdc5b4414cf6f76a14f4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ErrorModel__id$data } from "./ErrorModel__id.graphql";
import type { FragmentType } from "relay-runtime";
import {ErrorModel as errorModelRelayModelInstanceResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
// Type assertion validating that `errorModelRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(errorModelRelayModelInstanceResolverType: (
  id: ErrorModel__id$data['id'],
) => mixed);
declare export opaque type ErrorModel____relay_model_instance$fragmentType: FragmentType;
export type ErrorModel____relay_model_instance$data = {|
  +__relay_model_instance: $NonMaybeType<ReturnType<typeof errorModelRelayModelInstanceResolverType>>,
  +$fragmentType: ErrorModel____relay_model_instance$fragmentType,
|};
export type ErrorModel____relay_model_instance$key = {
  +$data?: ErrorModel____relay_model_instance$data,
  +$fragmentSpreads: ErrorModel____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ErrorModel____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ErrorModel__id"
      },
      "kind": "RelayResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./ErrorModel__id.graphql'), require('./../RelayResolverNullableModelClientEdge-test').ErrorModel, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "ErrorModel",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  ErrorModel____relay_model_instance$fragmentType,
  ErrorModel____relay_model_instance$data,
>*/);
