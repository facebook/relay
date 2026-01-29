/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fd377d5d3de24e2f1c670a344a8e7e6d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayResolversWithOutputTypeTestTextStyleComponentFragment$fragmentType } from "./RelayResolversWithOutputTypeTestTextStyleComponentFragment.graphql";
import type { RelayResolversWithOutputTypeTestTodoCompleteFragment$fragmentType } from "./RelayResolversWithOutputTypeTestTodoCompleteFragment.graphql";
import type { TodoTextResolverFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoTextResolverFragment.graphql";
import type { Todo__text$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Todo__text$normalization.graphql";
import type { FragmentType } from "relay-runtime";
import {text as todoTextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoTextResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `todoTextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoTextResolverType: (
  rootKey: TodoTextResolverFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?Todo__text$normalization);
declare export opaque type RelayResolversWithOutputTypeTestFragment$fragmentType: FragmentType;
export type RelayResolversWithOutputTypeTestFragment$data = {|
  +text: ?{|
    +content: string,
    +style: ?{|
      +$fragmentSpreads: RelayResolversWithOutputTypeTestTextStyleComponentFragment$fragmentType,
    |},
  |},
  +$fragmentSpreads: RelayResolversWithOutputTypeTestTodoCompleteFragment$fragmentType,
  +$fragmentType: RelayResolversWithOutputTypeTestFragment$fragmentType,
|};
export type RelayResolversWithOutputTypeTestFragment$key = {
  +$data?: RelayResolversWithOutputTypeTestFragment$data,
  +$fragmentSpreads: RelayResolversWithOutputTypeTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "hasClientEdges": true
  },
  "name": "RelayResolversWithOutputTypeTestFragment",
  "selections": [
    {
      "kind": "ClientEdgeToClientObject",
      "concreteType": "TodoText",
      "modelResolvers": null,
      "backingField": {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TodoTextResolverFragment"
        },
        "kind": "RelayResolver",
        "name": "text",
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/TodoTextResolver').text,
        "path": "text",
        "normalizationInfo": {
          "kind": "OutputType",
          "concreteType": "TodoText",
          "plural": false,
          "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Todo__text$normalization.graphql')
        }
      },
      "linkedField": {
        "alias": null,
        "args": null,
        "concreteType": "TodoText",
        "kind": "LinkedField",
        "name": "text",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "content",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TodoTextStyle",
            "kind": "LinkedField",
            "name": "style",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayResolversWithOutputTypeTestTextStyleComponentFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayResolversWithOutputTypeTestTodoCompleteFragment"
    }
  ],
  "type": "Todo",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0665939c2e5e80d5cd035ded7188831a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolversWithOutputTypeTestFragment$fragmentType,
  RelayResolversWithOutputTypeTestFragment$data,
>*/);
