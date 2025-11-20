/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f7d205e38a04a72f7a8cc1534d13a3bd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest2Fragment$fragmentType: FragmentType;
export type RelayReferenceMarkerTest2Fragment$data = {|
  +best_friends: ?{|
    +client_friends_connection_field: ?string,
    +edges: ?ReadonlyArray<?{|
      +client_friend_edge_field: ?string,
      +cursor: ?string,
      +node: ?{|
        +firstName: ?string,
        +id: string,
      |},
    |}>,
  |},
  +client_foo: ?{|
    +client_name: ?string,
    +profile_picture: ?{|
      +uri: ?string,
    |},
  |},
  +firstName: ?string,
  +nickname: ?string,
  +$fragmentType: RelayReferenceMarkerTest2Fragment$fragmentType,
|};
export type RelayReferenceMarkerTest2Fragment$key = {
  +$data?: RelayReferenceMarkerTest2Fragment$data,
  +$fragmentSpreads: RelayReferenceMarkerTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest2Fragment",
  "selections": [
    (v0/*: any*/),
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
              "kind": "ScalarField",
              "name": "client_friends_connection_field",
              "storageKey": null
            },
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
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "id",
                      "storageKey": null
                    },
                    (v0/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Foo",
          "kind": "LinkedField",
          "name": "client_foo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "client_name",
              "storageKey": null
            },
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "uri",
                  "storageKey": null
                }
              ],
              "storageKey": "profile_picture(scale:2)"
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
  (node/*: any*/).hash = "34600dc24690307d95ea58d1ef1e180c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTest2Fragment$fragmentType,
  RelayReferenceMarkerTest2Fragment$data,
>*/);
