/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5192dbe0183e27e868a93f398ae4631b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { ResolverThatThrows$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/ResolverThatThrows.graphql";
import {resolver_that_throws as userResolverThatThrowsResolverType} from "../../../relay-runtime/store/__tests__/resolvers/ResolverThatThrows.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userResolverThatThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userResolverThatThrowsResolverType: (
  rootKey: ResolverThatThrows$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?unknown>);
export type LiveResolversTest8Query$variables = {|
  id: string,
|};
export type LiveResolversTest8Query$data = {|
  +node: ?{|
    +name?: ?string,
    +resolver_that_throws?: ?ReturnType<ReturnType<typeof userResolverThatThrowsResolverType>["read"]>,
  |},
|};
export type LiveResolversTest8Query = {|
  response: LiveResolversTest8Query$data,
  variables: LiveResolversTest8Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest8Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "fragment": {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ResolverThatThrows"
                },
                "kind": "RelayLiveResolver",
                "name": "resolver_that_throws",
                "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/ResolverThatThrows').resolver_that_throws,
                "path": "node.resolver_that_throws"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LiveResolversTest8Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              {
                "name": "resolver_that_throws",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "username",
                      "storageKey": null
                    }
                  ],
                  "type": "User",
                  "abstractKey": null
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              }
            ],
            "type": "User",
            "abstractKey": null
          },
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
    ]
  },
  "params": {
    "cacheID": "0dd3544bf059df8fee5a16b39eb191f1",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest8Query",
    "operationKind": "query",
    "text": "query LiveResolversTest8Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      name\n      ...ResolverThatThrows\n    }\n    id\n  }\n}\n\nfragment ResolverThatThrows on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ec189df401880da95c79b741eaec1006";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest8Query$variables,
  LiveResolversTest8Query$data,
>*/);
