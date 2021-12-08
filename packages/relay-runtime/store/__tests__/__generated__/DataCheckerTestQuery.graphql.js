/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<be56560c4d282de98af9a702eb063723>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type DataCheckerTestQuery$variables = {|
  id?: ?string,
  size?: ?$ReadOnlyArray<?number>,
|};
export type DataCheckerTestQueryVariables = DataCheckerTestQuery$variables;
export type DataCheckerTestQuery$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +actors?: ?$ReadOnlyArray<?{|
      +name: ?string,
    |}>,
    +firstName?: ?string,
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +cursor: ?string,
        +node: ?{|
          +id: string,
          +firstName: ?string,
        |},
      |}>,
    |},
    +profilePicture?: ?{|
      +uri: ?string,
    |},
  |},
|};
export type DataCheckerTestQueryResponse = DataCheckerTestQuery$data;
export type DataCheckerTestQuery = {|
  variables: DataCheckerTestQueryVariables,
  response: DataCheckerTestQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
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
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
},
v6 = {
  "kind": "InlineFragment",
  "selections": [
    (v5/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 3
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
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                (v5/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "friends(first:3)"
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerTestQuery",
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
          (v3/*: any*/),
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
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          (v6/*: any*/)
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
    "name": "DataCheckerTestQuery",
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
          (v3/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "63981d12ed322538101b6a82cd439c4c",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTestQuery",
    "operationKind": "query",
    "text": "query DataCheckerTestQuery(\n  $id: ID\n  $size: [Int]\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on Page {\n      actors {\n        __typename\n        name\n        id\n      }\n    }\n    ... on User {\n      firstName\n      friends(first: 3) {\n        edges {\n          cursor\n          node {\n            id\n            firstName\n          }\n        }\n      }\n      profilePicture(size: $size) {\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "161a709f3f77e2725725ed8725497047";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTestQuery$variables,
  DataCheckerTestQuery$data,
>*/);
