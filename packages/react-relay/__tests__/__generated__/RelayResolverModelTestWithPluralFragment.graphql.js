/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bbf91af00e89ffe19c0fc8b34626df18>>
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
import type { TodoModel__many_fancy_descriptions$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__many_fancy_descriptions$normalization.graphql";
import type { TodoDescription } from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
import type { FragmentType } from "relay-runtime";
import {color as todoDescriptionColorResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionColorResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionColorResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
) => mixed);
import {text as todoDescriptionTextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionTextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionTextResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
) => ?string);
import {many_fancy_descriptions as todoModelManyFancyDescriptionsResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelManyFancyDescriptionsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelManyFancyDescriptionsResolverType: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'],
) => $ReadOnlyArray<?TodoDescription>);
declare export opaque type RelayResolverModelTestWithPluralFragment$fragmentType: FragmentType;
export type RelayResolverModelTestWithPluralFragment$data = {|
  +many_fancy_descriptions: ?$ReadOnlyArray<?{|
    +color: ?$Call<<R>((...empty[]) => R) => R, typeof todoDescriptionColorResolverType>,
    +text: ?string,
  |}>,
  +$fragmentType: RelayResolverModelTestWithPluralFragment$fragmentType,
|};
export type RelayResolverModelTestWithPluralFragment$key = {
  +$data?: RelayResolverModelTestWithPluralFragment$data,
  +$fragmentSpreads: RelayResolverModelTestWithPluralFragment$fragmentType,
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
  "name": "RelayResolverModelTestWithPluralFragment",
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
        "name": "many_fancy_descriptions",
        "resolverModule": require('relay-runtime/experimental').weakObjectWrapper(require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoModel').many_fancy_descriptions, '__relay_model_instance', false), '__relay_model_instance', true),
        "path": "many_fancy_descriptions",
        "normalizationInfo": {
          "concreteType": "TodoDescription",
          "plural": true,
          "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__many_fancy_descriptions$normalization.graphql')
        }
      },
      "linkedField": {
        "alias": null,
        "args": null,
        "concreteType": "TodoDescription",
        "kind": "LinkedField",
        "name": "many_fancy_descriptions",
        "plural": true,
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
    }
  ],
  "type": "TodoModel",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "37f1e843514eaeff4583a03f1c5b23fb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverModelTestWithPluralFragment$fragmentType,
  RelayResolverModelTestWithPluralFragment$data,
>*/);
