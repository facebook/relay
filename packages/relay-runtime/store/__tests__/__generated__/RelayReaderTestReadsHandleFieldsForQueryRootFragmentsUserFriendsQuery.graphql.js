/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cea7919be0a492c956382a0cb3f21880>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$variables = {|
  id: string,
|};
export type RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQueryVariables = RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$variables;
export type RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$data = {|
  +node: ?{|
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +cursor: ?string,
        +node: ?{|
          +id: string,
          +name: ?string,
        |},
      |}>,
    |},
  |},
|};
export type RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQueryResponse = RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$data;
export type RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery = {|
  variables: RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQueryVariables,
  response: RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$data,
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
  "name": "cursor",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "friends",
                "args": null,
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "__friends_bestFriends",
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
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": "name",
                            "args": null,
                            "kind": "ScalarField",
                            "name": "__name_friendsName",
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
            "type": "User",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery",
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
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*: any*/),
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
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "filters": null,
                            "handle": "friendsName",
                            "key": "",
                            "kind": "ScalarHandle",
                            "name": "name"
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "friends(first:1)"
              },
              {
                "alias": null,
                "args": (v4/*: any*/),
                "filters": null,
                "handle": "bestFriends",
                "key": "",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6b7d431f9b7a3080dc6d3a5822b56a62",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      friends(first: 1) {\n        edges {\n          cursor\n          node {\n            id\n            name\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "95bc24d97eeb913d23a0c1678854d5b3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$variables,
  RelayReaderTestReadsHandleFieldsForQueryRootFragmentsUserFriendsQuery$data,
>*/);
