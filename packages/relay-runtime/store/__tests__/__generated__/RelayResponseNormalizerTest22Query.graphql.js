/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<31574dbfd11c548514b083729c74b04b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest22Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest22QueryVariables = RelayResponseNormalizerTest22Query$variables;
export type RelayResponseNormalizerTest22Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +name?: ?string,
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
          +firstName: ?string,
        |},
      |}>,
    |},
  |},
|};
export type RelayResponseNormalizerTest22QueryResponse = RelayResponseNormalizerTest22Query$data;
export type RelayResponseNormalizerTest22Query = {|
  variables: RelayResponseNormalizerTest22QueryVariables,
  response: RelayResponseNormalizerTest22Query$data,
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
v2 = [
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      },
      {
        "kind": "InlineFragment",
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
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 2
              }
            ],
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FriendsEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "firstName",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:2)"
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
    "name": "RelayResponseNormalizerTest22Query",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest22Query",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "ad67894948f2d9d0bd771459df8aee91",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest22Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest22Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      name\n      friends(first: 2) {\n        edges {\n          node {\n            id\n            firstName\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "12de176e9df670d713e0748bf9c50f38";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest22Query$variables,
  RelayResponseNormalizerTest22Query$data,
>*/);
