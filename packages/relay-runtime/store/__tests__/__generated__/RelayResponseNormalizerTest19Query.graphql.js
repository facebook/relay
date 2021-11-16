/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<12554573d1b6feff02ceb2aa2e6ae0e2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest19Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest19QueryVariables = RelayResponseNormalizerTest19Query$variables;
export type RelayResponseNormalizerTest19Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +actors?: ?$ReadOnlyArray<?{|
      +id: string,
      +name: ?string,
      +__typename: string,
    |}>,
  |},
|};
export type RelayResponseNormalizerTest19QueryResponse = RelayResponseNormalizerTest19Query$data;
export type RelayResponseNormalizerTest19Query = {|
  variables: RelayResponseNormalizerTest19QueryVariables,
  response: RelayResponseNormalizerTest19Query$data,
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "type": "User",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest19Query",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest19Query",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "7a82d3b2aa987f8dad4ee554d97d4974",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest19Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest19Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actors {\n        id\n        name\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d5fa662de5d0ba3855a8566d08eab440";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest19Query$variables,
  RelayResponseNormalizerTest19Query$data,
>*/);
