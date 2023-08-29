/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e2bea2918e63bd00115168e730d6bfab>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { tests_TodoModel__id$data } from "./tests_TodoModel__id.graphql";
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import {TodoModel as todoModelRelayModelInstanceResolverType} from "../TodoModel.js";
// Type assertion validating that `todoModelRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelRelayModelInstanceResolverType: (
  id: tests_TodoModel__id$data['id'],
) => LiveState<mixed>);
declare export opaque type tests_TodoModel____relay_model_instance$fragmentType: FragmentType;
export type tests_TodoModel____relay_model_instance$data = {|
  +__relay_model_instance: ?ReturnType<ReturnType<typeof todoModelRelayModelInstanceResolverType>["read"]>,
  +$fragmentType: tests_TodoModel____relay_model_instance$fragmentType,
|};
export type tests_TodoModel____relay_model_instance$key = {
  +$data?: tests_TodoModel____relay_model_instance$data,
  +$fragmentSpreads: tests_TodoModel____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "tests_TodoModel____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "tests_TodoModel__id"
      },
      "kind": "RelayLiveResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./tests_TodoModel__id.graphql'), require('./../TodoModel').TodoModel, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "TodoModel",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  tests_TodoModel____relay_model_instance$fragmentType,
  tests_TodoModel____relay_model_instance$data,
>*/);
