/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bd1b9d3f7e8fa03407042331198d1a35>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {live_resolver_throws as queryLiveResolverThrowsResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryLiveResolverThrows.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryLiveResolverThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveResolverThrowsResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?unknown>);
export type LiveResolversTest18Query$variables = {||};
export type LiveResolversTest18Query$data = {|
  +live_resolver_throws: ?ReturnType<ReturnType<typeof queryLiveResolverThrowsResolverType>["read"]>,
|};
export type LiveResolversTest18Query = {|
  response: LiveResolversTest18Query$data,
  variables: LiveResolversTest18Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest18Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "live_resolver_throws",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryLiveResolverThrows').live_resolver_throws,
            "path": "live_resolver_throws"
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
    "name": "LiveResolversTest18Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "live_resolver_throws",
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
    "cacheID": "7d8ffbbc47d1c0c5884a06613521f30b",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest18Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ff79f7f1fb9a3cffea1d0903cfff24d0";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTest18Query$variables,
  LiveResolversTest18Query$data,
>*/);
