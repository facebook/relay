/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8b85df53eca2f88d248be049ee77d53f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoDescription____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql";
import type { TodoModel____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql";
import type { TodoModel__fancy_description$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__fancy_description$normalization.graphql";
import type { FragmentType } from "relay-runtime";
import {color as todoDescriptionColorResolver} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionColorResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionColorResolver: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'], 
) => mixed);
import {text as todoDescriptionTextResolver} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionTextResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionTextResolver: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'], 
) => ?string);
import {fancy_description as todoModelFancyDescriptionResolver} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelFancyDescriptionResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelFancyDescriptionResolver: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'], 
) => ?TodoModel__fancy_description$normalization['__relay_model_instance']);
declare export opaque type RelayResolverModelTestFragment$fragmentType: FragmentType;
export type RelayResolverModelTestFragment$data = {|
  +fancy_description: ?{|
    +color: ?$Call<<R>((...empty[]) => R) => R, typeof todoDescriptionColorResolver>,
    +text: ?string,
  |},
  +id: string,
  +$fragmentType: RelayResolverModelTestFragment$fragmentType,
|};
export type RelayResolverModelTestFragment$key = {
  +$data?: RelayResolverModelTestFragment$data,
  +$fragmentSpreads: RelayResolverModelTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "TodoDescription____relay_model_instance"
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "hasClientEdges": true
  },
  "name": "RelayResolverModelTestFragment",
  "selections": [
    {
      "kind": "ClientEdgeToClientObject",
      "concreteType": "TodoDescription",
      "backingField": {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TodoModel____relay_model_instance"
        },
        "kind": "RelayResolver",
        "name": "fancy_description",
        "resolverModule": require('relay-runtime/experimental').weakObjectWrapper(require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoModel').fancy_description, '__relay_model_instance', false), '__relay_model_instance', false),
        "path": "fancy_description",
        "normalizationInfo": {
          "concreteType": "TodoDescription",
          "plural": false,
          "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__fancy_description$normalization.graphql')
        }
      },
      "linkedField": {
        "alias": null,
        "args": null,
        "concreteType": "TodoDescription",
        "kind": "LinkedField",
        "name": "fancy_description",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": (v0/*: any*/),
            "kind": "RelayResolver",
            "name": "text",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoDescription').text, '__relay_model_instance', false),
            "path": "text"
          },
          {
            "alias": null,
            "args": null,
            "fragment": (v0/*: any*/),
            "kind": "RelayResolver",
            "name": "color",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoDescription').color, '__relay_model_instance', false),
            "path": "color"
          }
        ],
        "storageKey": null
      }
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "7bd57e46b080996faed28eb55ca25855";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverModelTestFragment$fragmentType,
  RelayResolverModelTestFragment$data,
>*/);
