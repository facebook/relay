/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5bd5069b51b8a11dff9aac87dd22d26a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayFlightUseQueryTestViewerQuery$variables = {||};
export type RelayFlightUseQueryTestViewerQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
|};
export type RelayFlightUseQueryTestViewerQuery = {|
  response: RelayFlightUseQueryTestViewerQuery$data,
  variables: RelayFlightUseQueryTestViewerQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayFlightUseQueryTestViewerQuery",
    "selections": [
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayFlightUseQueryTestViewerQuery",
    "selections": [
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v0/*: any*/),
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fd8264bd7529fec252f61e9cdb5d0fbd",
    "id": null,
    "metadata": {},
    "name": "RelayFlightUseQueryTestViewerQuery",
    "operationKind": "query",
    "text": "query RelayFlightUseQueryTestViewerQuery {\n  viewer {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "47c90be3921dd8a1453eabbc8a28ba4e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayFlightUseQueryTestViewerQuery$variables,
  RelayFlightUseQueryTestViewerQuery$data,
>*/);
