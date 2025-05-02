/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aca3af70e291f2643392fa74bcdd6a1f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { LiveCounterResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/LiveCounterResolver.graphql";
import {counter as queryCounterResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolverType: (
  rootKey: LiveCounterResolver$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type LiveResolversTest10Query$variables = {||};
export type LiveResolversTest10Query$data = {|
  +counter: ?number,
  +me: ?{|
    +name: ?string,
  |},
|};
export type LiveResolversTest10Query = {|
  response: LiveResolversTest10Query$data,
  variables: LiveResolversTest10Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest10Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LiveCounterResolver"
        },
        "kind": "RelayLiveResolver",
        "name": "counter",
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver').counter,
        "path": "counter"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTest10Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "name": "counter",
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
                (v1/*: any*/),
                {
                  "kind": "ClientExtension",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "__id",
                      "storageKey": null
                    }
                  ]
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
    "cacheID": "2d4c8ae6b53f0cfa015fdd43a8413e00",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest10Query",
    "operationKind": "query",
    "text": "query LiveResolversTest10Query {\n  me {\n    name\n    id\n  }\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a411a2231204bbce0a7d21c3b688397e";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest10Query$variables,
  LiveResolversTest10Query$data,
>*/);
