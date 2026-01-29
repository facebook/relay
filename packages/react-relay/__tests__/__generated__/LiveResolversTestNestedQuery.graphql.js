/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e478df1c6e693853d22b20cd0f2ebfb0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { InnerResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/InnerResolver.graphql";
import type { OuterResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/OuterResolver.graphql";
import {inner as queryInnerResolverType} from "../../../relay-runtime/store/__tests__/resolvers/InnerResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryInnerResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryInnerResolverType: (
  rootKey: InnerResolver$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
import {outer as queryOuterResolverType} from "../../../relay-runtime/store/__tests__/resolvers/OuterResolver.js";
// Type assertion validating that `queryOuterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryOuterResolverType: (
  rootKey: OuterResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?number);
export type LiveResolversTestNestedQuery$variables = {||};
export type LiveResolversTestNestedQuery$data = {|
  +inner: ?number,
  +outer: ?number,
|};
export type LiveResolversTestNestedQuery = {|
  response: LiveResolversTestNestedQuery$data,
  variables: LiveResolversTestNestedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "name": "inner",
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
            "name": "name",
            "storageKey": null
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "RelayResolver",
  "storageKey": null,
  "isOutputType": true
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestNestedQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "OuterResolver"
        },
        "kind": "RelayResolver",
        "name": "outer",
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/OuterResolver').outer,
        "path": "outer"
      },
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "InnerResolver"
        },
        "kind": "RelayLiveResolver",
        "name": "inner",
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/InnerResolver').inner,
        "path": "inner"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestNestedQuery",
    "selections": [
      {
        "name": "outer",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/)
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": true
      },
      (v0/*: any*/)
    ]
  },
  "params": {
    "cacheID": "b06013e5d66aef5b0fac57ce8557c076",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestNestedQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestNestedQuery {\n  ...OuterResolver\n  ...InnerResolver\n}\n\nfragment InnerResolver on Query {\n  me {\n    name\n    id\n  }\n}\n\nfragment OuterResolver on Query {\n  ...InnerResolver\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6985c8175a8d589a4b7a04f9e8bb0265";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestNestedQuery$variables,
  LiveResolversTestNestedQuery$data,
>*/);
