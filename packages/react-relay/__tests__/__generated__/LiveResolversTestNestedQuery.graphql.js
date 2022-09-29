/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<44791a1d4aecd5cb1ce764dda1b700c4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { InnerResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/InnerResolver.graphql";
import type { OuterResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/OuterResolver.graphql";
import queryInnerResolver from "../../../relay-runtime/store/__tests__/resolvers/InnerResolver.js";
// Type assertion validating that `queryInnerResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryInnerResolver: (
  rootKey: InnerResolver$key, 
) => LiveState<any>);
import queryOuterResolver from "../../../relay-runtime/store/__tests__/resolvers/OuterResolver.js";
// Type assertion validating that `queryOuterResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryOuterResolver: (
  rootKey: OuterResolver$key, 
) => mixed);
export type LiveResolversTestNestedQuery$variables = {||};
export type LiveResolversTestNestedQuery$data = {|
  +inner: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryInnerResolver>["read"]>,
  +outer: ?$Call<<R>((...empty[]) => R) => R, typeof queryOuterResolver>,
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
  "storageKey": null
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
        "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/OuterResolver'),
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
        "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/InnerResolver'),
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
        "storageKey": null
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
