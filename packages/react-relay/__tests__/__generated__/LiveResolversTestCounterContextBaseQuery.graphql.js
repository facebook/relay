/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<037817371343c160146009e57a039cfd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { BaseCounter____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/BaseCounter____relay_model_instance.graphql";
import {count_plus_one as baseCounterCountPlusOneResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `baseCounterCountPlusOneResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(baseCounterCountPlusOneResolverType: (
  __relay_model_instance: BaseCounter____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
import {base_counter_context as queryBaseCounterContextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver.js";
// Type assertion validating that `queryBaseCounterContextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryBaseCounterContextResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?BaseCounter>);
import type { BaseCounter } from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver.js";
export type LiveResolversTestCounterContextBaseQuery$variables = {||};
export type LiveResolversTestCounterContextBaseQuery$data = {|
  +base_counter_context: ?{|
    +count_plus_one: ?number,
  |},
|};
export type LiveResolversTestCounterContextBaseQuery = {|
  response: LiveResolversTestCounterContextBaseQuery$data,
  variables: LiveResolversTestCounterContextBaseQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "LiveResolversTestCounterContextBaseQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "BaseCounter",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "base_counter_context",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver').base_counter_context,
          "path": "base_counter_context",
          "normalizationInfo": {
            "kind": "WeakModel",
            "concreteType": "BaseCounter",
            "plural": false
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "BaseCounter",
          "kind": "LinkedField",
          "name": "base_counter_context",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "BaseCounter____relay_model_instance"
              },
              "kind": "RelayLiveResolver",
              "name": "count_plus_one",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/BaseCounter____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver').count_plus_one, '__relay_model_instance', true),
              "path": "base_counter_context.count_plus_one"
            }
          ],
          "storageKey": null
        }
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestCounterContextBaseQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "base_counter_context",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "BaseCounter",
          "kind": "LinkedField",
          "name": "base_counter_context",
          "plural": false,
          "selections": [
            {
              "name": "count_plus_one",
              "args": null,
              "fragment": {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__relay_model_instance",
                    "storageKey": null
                  }
                ],
                "type": "BaseCounter",
                "abstractKey": null
              },
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": true
            }
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "97f0edeb9700f58debe76b3ab0ca4f82",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestCounterContextBaseQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "a7ba71ed7b3caaefa42c8686bc81819c";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestCounterContextBaseQuery$variables,
  LiveResolversTestCounterContextBaseQuery$data,
>*/);
