/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<458285f5f40216367a323def2d47f530>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$ref = RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data = {|
  +id: string,
  +friends: ?{|
    +client_friends_connection_field: ?string,
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +firstName: ?string,
        +client_foo: ?{|
          +client_name: ?string,
        |},
      |},
    |}>,
  |},
  +nickname: ?string,
  +client_actor_field: ?string,
  +client_foo: ?{|
    +client_name: ?string,
    +profile_picture: ?{|
      +uri: ?string,
    |},
  |},
  +best_friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +client_friend_edge_field: ?string,
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +client_actor_field?: ?string,
        +profilePicture?: ?{|
          +uri: ?string,
          +height: ?number,
          +width: ?number,
        |},
      |},
    |}>,
  |},
  +$fragmentType: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
|};
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile = RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$key = {
  +$data?: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data,
  +$fragmentSpreads: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "client_name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "client_actor_field",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile",
  "selections": [
    (v0/*: any*/),
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
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
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
                        (v2/*: any*/)
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
            (v3/*: any*/)
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
        (v3/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Foo",
          "kind": "LinkedField",
          "name": "client_foo",
          "plural": false,
          "selections": [
            (v2/*: any*/),
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
                (v4/*: any*/)
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
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v0/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v3/*: any*/),
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
                            (v4/*: any*/),
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
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "be1193f9af652f17c3230d030ea0ae72";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
  RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data,
>*/);
