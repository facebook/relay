/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<955d809212fe3551753c52fe35f16029>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { NodeResolversGreeting$key } from "./../resolvers/__generated__/NodeResolversGreeting.graphql";
import {node_greeting as nodeNodeGreetingResolverType} from "../resolvers/NodeResolvers.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `nodeNodeGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(nodeNodeGreetingResolverType: (
  rootKey: NodeResolversGreeting$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest25Query$variables = {||};
export type RelayReaderResolverTest25Query$data = {|
  +node: ?{|
    +node_greeting: ?string,
  |},
|};
export type RelayReaderResolverTest25Query = {|
  response: RelayReaderResolverTest25Query$data,
  variables: RelayReaderResolverTest25Query$variables,
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
    "name": "RelayReaderResolverTest25Query",
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
            "resolverModule": require('../resolvers/NodeResolvers').node_greeting,
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
    "name": "RelayReaderResolverTest25Query",
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
    "cacheID": "f45444dd5ba3621bd9776c95943347b0",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest25Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest25Query {\n  node(id: \"4\") {\n    __typename\n    ...NodeResolversGreeting\n    id\n  }\n}\n\nfragment NodeResolversGreeting on Node {\n  __isNode: __typename\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d4276dad57c78400bc1870e9d0c6e6e7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest25Query$variables,
  RelayReaderResolverTest25Query$data,
>*/);
