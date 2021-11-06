/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<86bc3ca2797f64bb59f61bcab4a938f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type requestSubscriptionTestConfigsQueryVariables = {||};
export type requestSubscriptionTestConfigsQueryResponse = {|
  +viewer: ?{|
    +configs: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +name: ?string,
        |},
      |}>,
    |},
  |},
|};
export type requestSubscriptionTestConfigsQuery = {|
  variables: requestSubscriptionTestConfigsQueryVariables,
  response: requestSubscriptionTestConfigsQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ConfigsConnection",
        "kind": "LinkedField",
        "name": "configs",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ConfigsConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Config",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "requestSubscriptionTestConfigsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "requestSubscriptionTestConfigsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "2e8459a1348e993fdb5ffe578b057275",
    "id": null,
    "metadata": {},
    "name": "requestSubscriptionTestConfigsQuery",
    "operationKind": "query",
    "text": "query requestSubscriptionTestConfigsQuery {\n  viewer {\n    configs {\n      edges {\n        node {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "16ca9c7a54273df2636b21f815941e23";
}

module.exports = node;
