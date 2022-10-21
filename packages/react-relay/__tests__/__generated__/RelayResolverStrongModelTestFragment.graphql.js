/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<89d38117a3414099d2ab7ba045ad1244>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoModel__id$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__id.graphql";
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import {TodoModel as todoModelRelayModelInstanceResolver} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelRelayModelInstanceResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelRelayModelInstanceResolver: (
  id: TodoModel__id$data['id'], 
) => LiveState<any>);
declare export opaque type RelayResolverStrongModelTestFragment$fragmentType: FragmentType;
export type RelayResolverStrongModelTestFragment$data = {|
  +__relay_model_instance: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof todoModelRelayModelInstanceResolver>["read"]>,
  +id: string,
  +$fragmentType: RelayResolverStrongModelTestFragment$fragmentType,
|};
export type RelayResolverStrongModelTestFragment$key = {
  +$data?: RelayResolverStrongModelTestFragment$data,
  +$fragmentSpreads: RelayResolverStrongModelTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverStrongModelTestFragment",
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
      "resolverModule": require('relay-runtime/store/experimental-live-resolvers/FragmentDataInjector')(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__id.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoModel').TodoModel, 'id'),
      "path": "__relay_model_instance"
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "TodoModel",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "96aafd7990c887dc3e118f597ee44be8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverStrongModelTestFragment$fragmentType,
  RelayResolverStrongModelTestFragment$data,
>*/);
