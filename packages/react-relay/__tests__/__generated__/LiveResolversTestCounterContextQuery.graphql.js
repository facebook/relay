/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<44ecd07b6b22d9bf7257979f562cd28a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_context as queryCounterContextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterContextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterContextResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type LiveResolversTestCounterContextQuery$variables = {||};
export type LiveResolversTestCounterContextQuery$data = {|
  +counter_context: ?number,
|};
export type LiveResolversTestCounterContextQuery = {|
  response: LiveResolversTestCounterContextQuery$data,
  variables: LiveResolversTestCounterContextQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestCounterContextQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_context",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterContextResolver').counter_context,
            "path": "counter_context"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestCounterContextQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "counter_context",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "f6e0f5736d77c8611c8b72925ede3c25",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestCounterContextQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "4ea67e398a3218352a2ff2f6d2260202";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestCounterContextQuery$variables,
  LiveResolversTestCounterContextQuery$data,
>*/);
