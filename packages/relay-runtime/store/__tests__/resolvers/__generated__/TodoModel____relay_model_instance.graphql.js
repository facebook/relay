/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5907090a31d5a7bf8e5b42c2376ef7cf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoModel__id$data } from "./TodoModel__id.graphql";
import type { LiveState, FragmentType } from "relay-runtime";
import {TodoModel as todoModelRelayModelInstanceResolverType} from "../TodoModel.js";
// Type assertion validating that `todoModelRelayModelInstanceResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelRelayModelInstanceResolverType: (
  id: TodoModel__id$data['id'],
) => LiveState<mixed>);
declare export opaque type TodoModel____relay_model_instance$fragmentType: FragmentType;
export type TodoModel____relay_model_instance$data = {|
  +__relay_model_instance: $NonMaybeType<ReturnType<ReturnType<typeof todoModelRelayModelInstanceResolverType>["read"]>>,
  +$fragmentType: TodoModel____relay_model_instance$fragmentType,
|};
export type TodoModel____relay_model_instance$key = {
  +$data?: TodoModel____relay_model_instance$data,
  +$fragmentSpreads: TodoModel____relay_model_instance$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoModel____relay_model_instance",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "TodoModel__id"
      },
      "kind": "RelayLiveResolver",
      "name": "__relay_model_instance",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./TodoModel__id.graphql'), require('./../TodoModel').TodoModel, 'id', true),
      "path": "__relay_model_instance"
    }
  ],
  "type": "TodoModel",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  TodoModel____relay_model_instance$fragmentType,
  TodoModel____relay_model_instance$data,
>*/);
