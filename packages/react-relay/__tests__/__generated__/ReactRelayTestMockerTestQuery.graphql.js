/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ffa8ff22fefd555c9a98fbabfa887abf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type ReactRelayTestMockerTestQuery$variables = {||};
export type ReactRelayTestMockerTestQueryVariables = ReactRelayTestMockerTestQuery$variables;
export type ReactRelayTestMockerTestQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type ReactRelayTestMockerTestQueryResponse = ReactRelayTestMockerTestQuery$data;
export type ReactRelayTestMockerTestQuery = {|
  variables: ReactRelayTestMockerTestQueryVariables,
  response: ReactRelayTestMockerTestQuery$data,
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
    "name": "ReactRelayTestMockerTestQuery",
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ReactRelayTestMockerTestQuery",
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
    "cacheID": "0bb4b036ca5256815be5b5ab6fc23329",
    "id": null,
    "metadata": {},
    "name": "ReactRelayTestMockerTestQuery",
    "operationKind": "query",
    "text": "query ReactRelayTestMockerTestQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "130eb1e0c99c8856e670b7153c60015e";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayTestMockerTestQuery$variables,
  ReactRelayTestMockerTestQuery$data,
>*/);
