/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d7569abd3e4583103aff92e2df2628e8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { TodoDescription____relay_model_instance$data } from "./TodoDescription____relay_model_instance.graphql";
import type { FragmentType } from "relay-runtime";
import {color as todoDescriptionColorResolverType} from "../TodoDescription.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `todoDescriptionColorResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionColorResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?unknown);
declare export opaque type TodoDescription_text_style$fragmentType: FragmentType;
export type TodoDescription_text_style$data = {|
  +color: NonNullable<ReturnType<typeof todoDescriptionColorResolverType>>,
  +$fragmentType: TodoDescription_text_style$fragmentType,
|};
export type TodoDescription_text_style$key = {
  +$data?: TodoDescription_text_style$data,
  +$fragmentSpreads: TodoDescription_text_style$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoDescription_text_style",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TodoDescription____relay_model_instance"
        },
        "kind": "RelayResolver",
        "name": "color",
        "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./TodoDescription____relay_model_instance.graphql'), require('../TodoDescription').color, '__relay_model_instance', true),
        "path": "color"
      },
      "action": "THROW"
    }
  ],
  "type": "TodoDescription",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "52e426266439c85da8dce2dda6133fe2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  TodoDescription_text_style$fragmentType,
  TodoDescription_text_style$data,
>*/);
