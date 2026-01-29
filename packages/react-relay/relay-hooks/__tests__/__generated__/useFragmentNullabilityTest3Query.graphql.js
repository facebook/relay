/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b695e94e12cb58dbb47628319a156521>>
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
export type useFragmentNullabilityTest3Query$variables = {||};
export type useFragmentNullabilityTest3Query$data = {|
  +field_with_fragment_that_throws: ?number,
|};
export type useFragmentNullabilityTest3Query = {|
  response: useFragmentNullabilityTest3Query$data,
  variables: useFragmentNullabilityTest3Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentNullabilityTest3Query",
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
    "name": "useFragmentNullabilityTest3Query",
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
    "cacheID": "562cd30e823ff158eed24ab0375df95c",
    "id": null,
    "metadata": {},
    "name": "useFragmentNullabilityTest3Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "10916d7ec8d66dc54d930f21305b5778";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  useFragmentNullabilityTest3Query$variables,
  useFragmentNullabilityTest3Query$data,
>*/);
