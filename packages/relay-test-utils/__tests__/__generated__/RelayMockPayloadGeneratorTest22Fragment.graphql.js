/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e77c21791a616b3250444201045ee48e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest21Fragment$fragmentType = any;
type RelayMockPayloadGeneratorTest23Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest22Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest22Fragment$ref = RelayMockPayloadGeneratorTest22Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest22Fragment$data = {|
  +id: string,
  +name: ?string,
  +myActor: ?{|
    +id: string,
    +name: ?string,
  |},
  +customName: ?string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +name: ?string,
      |},
    |}>,
    +myPageInfo: ?{|
      +endCursor: ?string,
      +hasNextPage: ?boolean,
    |},
  |},
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +actor: ?{|
    +username: ?string,
    +id?: string,
    +userName?: ?string,
    +name?: ?string,
    +profilePicture?: ?{|
      +uri: ?string,
      +width: ?number,
      +height: ?number,
    |},
    +feedback?: ?{|
      +comments: ?{|
        +edges: ?$ReadOnlyArray<?{|
          +node: ?{|
            +$fragmentSpreads: RelayMockPayloadGeneratorTest23Fragment$fragmentType,
          |},
        |}>,
      |},
    |},
    +pageName?: ?string,
  |},
  +$fragmentSpreads: RelayMockPayloadGeneratorTest21Fragment$fragmentType,
  +$fragmentType: RelayMockPayloadGeneratorTest22Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest22Fragment = RelayMockPayloadGeneratorTest22Fragment$data;
export type RelayMockPayloadGeneratorTest22Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest22Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest22Fragment$fragmentType,
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
  "name": "name",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "endCursor",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "hasNextPage",
    "storageKey": null
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
},
v4 = [
  (v3/*: any*/)
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "RELAY_INCREMENTAL_DELIVERY"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "condition"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    },
    {
      "kind": "RootArgument",
      "name": "picturePreset"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": null,
        "direction": "forward",
        "path": [
          "friends"
        ]
      }
    ]
  },
  "name": "RelayMockPayloadGeneratorTest22Fragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": "myActor",
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": "customName",
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": "friends",
      "args": null,
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__User_friends_connection",
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
                (v0/*: any*/),
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": "myPageInfo",
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": (v2/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": (v2/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": (v4/*: any*/),
      "storageKey": null
    },
    {
      "condition": "condition",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "preset",
              "variableName": "picturePreset"
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture",
          "plural": false,
          "selections": (v4/*: any*/),
          "storageKey": null
        }
      ]
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayMockPayloadGeneratorTest21Fragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": "userName",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": "name",
              "args": null,
              "kind": "ScalarField",
              "name": "username",
              "storageKey": null
            },
            {
              "alias": null,
              "args": [
                {
                  "kind": "Literal",
                  "name": "size",
                  "value": 1
                }
              ],
              "concreteType": "Image",
              "kind": "LinkedField",
              "name": "profilePicture",
              "plural": false,
              "selections": [
                (v3/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "width",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "height",
                  "storageKey": null
                }
              ],
              "storageKey": "profilePicture(size:1)"
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Feedback",
              "kind": "LinkedField",
              "name": "feedback",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "CommentsConnection",
                  "kind": "LinkedField",
                  "name": "comments",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "CommentsEdge",
                      "kind": "LinkedField",
                      "name": "edges",
                      "plural": true,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Comment",
                          "kind": "LinkedField",
                          "name": "node",
                          "plural": false,
                          "selections": [
                            {
                              "kind": "Defer",
                              "selections": [
                                {
                                  "args": null,
                                  "kind": "FragmentSpread",
                                  "name": "RelayMockPayloadGeneratorTest23Fragment"
                                }
                              ]
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
              "storageKey": null
            }
          ],
          "type": "User",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": "pageName",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "type": "Page",
          "abstractKey": null
        },
        {
          "alias": "username",
          "args": null,
          "kind": "ScalarField",
          "name": "__username_MyUserName",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "08c62813cbbac5cf9a652eb692b64132";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest22Fragment$fragmentType,
  RelayMockPayloadGeneratorTest22Fragment$data,
>*/);
