/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3da2f5b9435639cb76f7c803e4954131>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType } from "./RelayReaderTestReadsHandleFieldsForFragmentsUserFriends.graphql";
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery$variables = {||};
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
  |},
|};
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery = {|
  response: RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery$data,
  variables: RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v1 = {
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
    "name": "RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery",
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
            "name": "RelayReaderTestReadsHandleFieldsForFragmentsUserFriends"
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
    "name": "RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery",
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
            "alias": null,
            "args": (v0/*: any*/),
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
                      (v1/*: any*/),
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
            "args": (v0/*: any*/),
            "filters": null,
            "handle": "bestFriends",
            "key": "",
            "kind": "LinkedHandle",
            "name": "friends"
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "04a9cda59f7028eff9df663725d00531",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery {\n  me {\n    ...RelayReaderTestReadsHandleFieldsForFragmentsUserFriends\n    id\n  }\n}\n\nfragment RelayReaderTestReadsHandleFieldsForFragmentsUserFriends on User {\n  friends(first: 1) {\n    edges {\n      cursor\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2ac225f5ec97e79b7c664322027462a2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery$variables,
  RelayReaderTestReadsHandleFieldsForFragmentsUserFriendsQuery$data,
>*/);
