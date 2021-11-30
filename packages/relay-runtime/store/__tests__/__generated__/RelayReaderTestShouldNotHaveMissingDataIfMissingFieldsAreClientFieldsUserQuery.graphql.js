/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1920c75285410337181cf096ccf5858c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType = any;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQueryVariables = RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$variables;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQueryResponse = RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$data;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery = {|
  variables: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQueryVariables,
  response: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
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
  "name": "cursor",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "client_name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "client_actor_field",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile"
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
    "name": "RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
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
                  (v2/*: any*/),
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
                      },
                      {
                        "kind": "ClientExtension",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Foo",
                            "kind": "LinkedField",
                            "name": "client_foo",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "client_friends_connection_field",
                    "storageKey": null
                  }
                ]
              }
            ],
            "storageKey": "friends(first:3)"
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "ClientExtension",
                "selections": [
                  (v4/*: any*/)
                ]
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
          },
          {
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "nickname",
                "storageKey": null
              },
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Foo",
                "kind": "LinkedField",
                "name": "client_foo",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "scale",
                        "value": 2
                      }
                    ],
                    "concreteType": "Image",
                    "kind": "LinkedField",
                    "name": "profile_picture",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/)
                    ],
                    "storageKey": "profile_picture(scale:2)"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "best_friends",
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
                        "name": "client_friend_edge_field",
                        "storageKey": null
                      },
                      (v2/*: any*/),
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
                            "kind": "InlineFragment",
                            "selections": [
                              (v4/*: any*/),
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
                                  (v5/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "height",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "width",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "Actor",
                            "abstractKey": "__isActor"
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
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "36e2ca514da85674c5870015d9d09468",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery {\n  me {\n    ...RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile on User {\n  id\n  friends(first: 3) {\n    edges {\n      cursor\n      node {\n        id\n        firstName\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bd858976002087b3fee19b50cc499727";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$variables,
  RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserQuery$data,
>*/);
