/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f7ba4612b938328ca470409de44dc149>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType: FragmentType;
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data = {
  readonly best_friends: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly client_friend_edge_field: ?string,
      readonly cursor: ?string,
      readonly node: ?{
        readonly client_actor_field?: ?string,
        readonly id: string,
        readonly profilePicture?: ?{
          readonly height: ?number,
          readonly uri: ?string,
          readonly width: ?number,
        },
      },
    }>,
  },
  readonly client_actor_field: ?string,
  readonly client_foo: ?{
    readonly client_name: ?string,
    readonly profile_picture: ?{
      readonly uri: ?string,
    },
  },
  readonly friends: ?{
    readonly client_friends_connection_field: ?string,
    readonly edges: ?ReadonlyArray<?{
      readonly cursor: ?string,
      readonly node: ?{
        readonly client_foo: ?{
          readonly client_name: ?string,
        },
        readonly firstName: ?string,
        readonly id: string,
      },
    }>,
  },
  readonly id: string,
  readonly nickname: ?string,
  readonly $fragmentType: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
};
export type RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$key = {
  readonly $data?: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data,
  readonly $fragmentSpreads: RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
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
    (v0/*:: as any*/),
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
            (v1/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*:: as any*/),
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
                        (v2/*:: as any*/)
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
            (v3/*:: as any*/)
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
        (v3/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Foo",
          "kind": "LinkedField",
          "name": "client_foo",
          "plural": false,
          "selections": [
            (v2/*:: as any*/),
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
                (v4/*:: as any*/)
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
                (v1/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v0/*:: as any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v3/*:: as any*/),
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
                            (v4/*:: as any*/),
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
  (node/*:: as any*/).hash = "be1193f9af652f17c3230d030ea0ae72";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$fragmentType,
  RelayReaderTestShouldNotHaveMissingDataIfMissingFieldsAreClientFieldsUserProfile$data,
>*/);
