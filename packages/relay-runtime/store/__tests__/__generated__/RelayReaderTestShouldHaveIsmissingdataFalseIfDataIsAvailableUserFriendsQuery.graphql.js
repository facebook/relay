/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7949315a649e3ddda87be498f46a167f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType } from "./RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends.graphql";
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery$variables = {||};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery = {|
  response: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery$data,
  variables: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery",
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
            "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
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
                      (v0/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:3)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b1df23d18d90f111792745c7a373ee14",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery {\n  me {\n    ...RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends\n    id\n  }\n}\n\nfragment RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends on User {\n  id\n  friends(first: 3) {\n    edges {\n      cursor\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5c8e7c278a183816c699d12ac87c1d8c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery$variables,
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriendsQuery$data,
>*/);
