/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c325b19aa1ffdacf585cb891aad95ee2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoModel____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql";
import type { FragmentType } from "relay-runtime";
import {description as todoModelDescriptionResolver} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelDescriptionResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelDescriptionResolver: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'], 
) => mixed);
declare export opaque type RelayResolverStrongModelTestFragment$fragmentType: FragmentType;
export type RelayResolverStrongModelTestFragment$data = {|
  +description: ?$Call<<R>((...empty[]) => R) => R, typeof todoModelDescriptionResolver>,
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
        "name": "TodoModel____relay_model_instance"
      },
      "kind": "RelayResolver",
      "name": "description",
      "resolverModule": require('relay-runtime/store/experimental-live-resolvers/FragmentDataInjector')(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoModel').description, '__relay_model_instance'),
      "path": "description"
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
  (node/*: any*/).hash = "799664390b166cbb0e41946da936f9d7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverStrongModelTestFragment$fragmentType,
  RelayResolverStrongModelTestFragment$data,
>*/);
