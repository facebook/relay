/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<460ee893682cc66f3f00f29fb4d5780d>>
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
import {another_value_from_context as todoModelAnotherValueFromContextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `todoModelAnotherValueFromContextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelAnotherValueFromContextResolverType: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import {description as todoModelDescriptionResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelDescriptionResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelDescriptionResolverType: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type RelayResolverModelWithContextTestFragment$fragmentType: FragmentType;
export type RelayResolverModelWithContextTestFragment$data = {|
  +another_value_from_context: ?string,
  +description: ?string,
  +id: string,
  +$fragmentType: RelayResolverModelWithContextTestFragment$fragmentType,
|};
export type RelayResolverModelWithContextTestFragment$key = {
  +$data?: RelayResolverModelWithContextTestFragment$data,
  +$fragmentSpreads: RelayResolverModelWithContextTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "TodoModel____relay_model_instance"
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverModelWithContextTestFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": (v0/*: any*/),
      "kind": "RelayResolver",
      "name": "description",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').description, '__relay_model_instance', true),
      "path": "description"
    },
    {
      "alias": null,
      "args": null,
      "fragment": (v0/*: any*/),
      "kind": "RelayResolver",
      "name": "another_value_from_context",
      "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').another_value_from_context, '__relay_model_instance', true),
      "path": "another_value_from_context"
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
  (node/*: any*/).hash = "5373c916bad7d7b7c83e32558cfde3d4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverModelWithContextTestFragment$fragmentType,
  RelayResolverModelWithContextTestFragment$data,
>*/);
