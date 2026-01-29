/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3e68f3ca839652cc36ec9e58aea48ac4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { useFragmentNullabilityTestFragmentWithFieldThatThrows$key } from "./useFragmentNullabilityTestFragmentWithFieldThatThrows.graphql";
import {field_with_fragment_that_throws as queryFieldWithFragmentThatThrowsResolverType} from "../useFragment_nullability-test.js";
import type { TestResolverContextType } from "../../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryFieldWithFragmentThatThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryFieldWithFragmentThatThrowsResolverType: (
  rootKey: useFragmentNullabilityTestFragmentWithFieldThatThrows$key,
  args: void,
  context: TestResolverContextType,
) => number);
export type useFragmentNullabilityTest2Query$variables = {||};
export type useFragmentNullabilityTest2Query$data = {|
  +field_with_fragment_that_throws: number,
|};
export type useFragmentNullabilityTest2Query = {|
  response: useFragmentNullabilityTest2Query$data,
  variables: useFragmentNullabilityTest2Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "useFragmentNullabilityTest2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "useFragmentNullabilityTestFragmentWithFieldThatThrows"
        },
        "kind": "RelayResolver",
        "name": "field_with_fragment_that_throws",
        "resolverModule": require('../useFragment_nullability-test').field_with_fragment_that_throws,
        "path": "field_with_fragment_that_throws"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useFragmentNullabilityTest2Query",
    "selections": [
      {
        "name": "field_with_fragment_that_throws",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            {
              "kind": "ClientExtension",
              "selections": [
                {
                  "name": "field_that_throws",
                  "args": null,
                  "fragment": null,
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ]
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
    "cacheID": "dc2a856d03fd42d985e8b68abf6ae426",
    "id": null,
    "metadata": {},
    "name": "useFragmentNullabilityTest2Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "2abb5a27637c0fa0c8c03068f4148d51";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  useFragmentNullabilityTest2Query$variables,
  useFragmentNullabilityTest2Query$data,
>*/);
