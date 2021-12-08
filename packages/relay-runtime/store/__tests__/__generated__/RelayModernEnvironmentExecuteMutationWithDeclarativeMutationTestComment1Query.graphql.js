/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bccbbba214cb2903fbb7e76c93ab134b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1QueryVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$data = {|
  +node: ?{|
    +id: string,
    +body: ?{|
      +text: ?string,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1QueryResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1QueryVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$data,
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "Text",
  "kind": "LinkedField",
  "name": "body",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query",
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
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8d20b32b1c51f9375ba1f2feb07aed7e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    body {\n      text\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1e8fdeaafe483c2f9a2db5ca688aab92";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestComment1Query$data,
>*/);
