/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<99027ecd32b72e3db29e851998075f28>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { NodeResolversGreeting$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/NodeResolversGreeting.graphql";
import {node_greeting as nodeNodeGreetingResolverType} from "../../../relay-runtime/store/__tests__/resolvers/NodeResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `nodeNodeGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(nodeNodeGreetingResolverType: (
  rootKey: NodeResolversGreeting$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayResolversAbstractTypeRootFragmentTestQuery$variables = {||};
export type RelayResolversAbstractTypeRootFragmentTestQuery$data = {|
  +node: ?{|
    +node_greeting: ?string,
  |},
|};
export type RelayResolversAbstractTypeRootFragmentTestQuery = {|
  response: RelayResolversAbstractTypeRootFragmentTestQuery$data,
  variables: RelayResolversAbstractTypeRootFragmentTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
],
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
    "name": "RelayResolversAbstractTypeRootFragmentTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "NodeResolversGreeting"
            },
            "kind": "RelayResolver",
            "name": "node_greeting",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/NodeResolvers').node_greeting,
            "path": "node.node_greeting"
          }
        ],
        "storageKey": "node(id:\"4\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolversAbstractTypeRootFragmentTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
            "name": "node_greeting",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                (v1/*: any*/)
              ],
              "type": "Node",
              "abstractKey": "__isNode"
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          },
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"4\")"
      }
    ]
  },
  "params": {
    "cacheID": "16a426563480b45f425459f7da9a621f",
    "id": null,
    "metadata": {},
    "name": "RelayResolversAbstractTypeRootFragmentTestQuery",
    "operationKind": "query",
    "text": "query RelayResolversAbstractTypeRootFragmentTestQuery {\n  node(id: \"4\") {\n    __typename\n    ...NodeResolversGreeting\n    id\n  }\n}\n\nfragment NodeResolversGreeting on Node {\n  __isNode: __typename\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "38ce80d969e3fdad2e27031ddd534888";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResolversAbstractTypeRootFragmentTestQuery$variables,
  RelayResolversAbstractTypeRootFragmentTestQuery$data,
>*/);
