/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d1dff6ff2368c151206663dbfb774a10>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest14Fragment$fragmentType: FragmentType;
export type DataCheckerTest14Fragment$ref = DataCheckerTest14Fragment$fragmentType;
export type DataCheckerTest14Fragment$data = {|
  +id: string,
  +firstName: ?string,
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
        +client_foo: ?{|
          +client_name: ?string,
          +profile_picture: ?{|
            +uri: ?string,
          |},
        |},
        +client_actor_field?: ?string,
        +profilePicture?: ?{|
          +uri: ?string,
          +height: ?number,
          +width: ?number,
        |},
      |},
    |}>,
  |},
  +$fragmentType: DataCheckerTest14Fragment$fragmentType,
|};
export type DataCheckerTest14Fragment = DataCheckerTest14Fragment$data;
export type DataCheckerTest14Fragment$key = {
  +$data?: DataCheckerTest14Fragment$data,
  +$fragmentSpreads: DataCheckerTest14Fragment$fragmentType,
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
  "name": "client_actor_field",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v3 = {
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
        (v2/*: any*/)
      ],
      "storageKey": "profile_picture(scale:2)"
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest14Fragment",
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
        (v1/*: any*/),
        (v3/*: any*/),
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
                    (v0/*: any*/),
                    (v3/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v1/*: any*/),
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
                            (v2/*: any*/),
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
  (node/*: any*/).hash = "99de1670b248e2c0d7cebc896f86a2fd";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest14Fragment$fragmentType,
  DataCheckerTest14Fragment$data,
>*/);
