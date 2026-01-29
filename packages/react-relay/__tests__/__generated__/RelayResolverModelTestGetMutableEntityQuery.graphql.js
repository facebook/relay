/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c8c2ece040e8c9091c98e87eed62afa6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {mutable_entity as queryMutableEntityResolverType} from "../../../relay-runtime/store/__tests__/resolvers/MutableModel.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryMutableEntityResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryMutableEntityResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?unknown>);
export type RelayResolverModelTestGetMutableEntityQuery$variables = {||};
export type RelayResolverModelTestGetMutableEntityQuery$data = {|
  +mutable_entity: ?ReturnType<ReturnType<typeof queryMutableEntityResolverType>["read"]>,
|};
export type RelayResolverModelTestGetMutableEntityQuery = {|
  response: RelayResolverModelTestGetMutableEntityQuery$data,
  variables: RelayResolverModelTestGetMutableEntityQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResolverModelTestGetMutableEntityQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "mutable_entity",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/MutableModel').mutable_entity,
            "path": "mutable_entity"
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
    "name": "RelayResolverModelTestGetMutableEntityQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "mutable_entity",
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
    "cacheID": "aa33fbf58d2c2c1640de7da7280d2f2e",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestGetMutableEntityQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "bd6186904ff5b69591c6929ee7f72aa4";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestGetMutableEntityQuery$variables,
  RelayResolverModelTestGetMutableEntityQuery$data,
>*/);
