/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<02cb2d2d39e4dc014fbd31a92ad39b59>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { LiveCounterWithPossibleMissingFragmentDataResolverFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/LiveCounterWithPossibleMissingFragmentDataResolverFragment.graphql";
import {live_counter_with_possible_missing_fragment_data as queryLiveCounterWithPossibleMissingFragmentDataResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterWithPossibleMissingFragmentDataResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryLiveCounterWithPossibleMissingFragmentDataResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveCounterWithPossibleMissingFragmentDataResolverType: (
  rootKey: LiveCounterWithPossibleMissingFragmentDataResolverFragment$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type LiveResolversTestWithGCQuery$variables = {||};
export type LiveResolversTestWithGCQuery$data = {|
  +live_counter_with_possible_missing_fragment_data: ?number,
|};
export type LiveResolversTestWithGCQuery = {|
  response: LiveResolversTestWithGCQuery$data,
  variables: LiveResolversTestWithGCQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestWithGCQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LiveCounterWithPossibleMissingFragmentDataResolverFragment"
        },
        "kind": "RelayLiveResolver",
        "name": "live_counter_with_possible_missing_fragment_data",
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterWithPossibleMissingFragmentDataResolver').live_counter_with_possible_missing_fragment_data,
        "path": "live_counter_with_possible_missing_fragment_data"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestWithGCQuery",
    "selections": [
      {
        "name": "live_counter_with_possible_missing_fragment_data",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "me",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": true
      }
    ]
  },
  "params": {
    "cacheID": "ee93be3ff70212f4339f103e293dab73",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestWithGCQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestWithGCQuery {\n  ...LiveCounterWithPossibleMissingFragmentDataResolverFragment\n}\n\nfragment LiveCounterWithPossibleMissingFragmentDataResolverFragment on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e0069f7ccf8ba4baa2b3bfeaa62199fa";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestWithGCQuery$variables,
  LiveResolversTestWithGCQuery$data,
>*/);
