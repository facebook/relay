/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0cbf802253119606be851dc61dd4ce1d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$ref = any;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQueryVariables = {||};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$ref,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQuery = {|
  variables: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQueryVariables,
  response: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQueryResponse,
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
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQuery",
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
            "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends"
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
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQuery",
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
                "value": 1
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
            "storageKey": "friends(first:1)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e2fbcd7261bb59065ba414d686807898",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserQuery {\n  me {\n    ...RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends\n    id\n  }\n}\n\nfragment RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends on User {\n  id\n  friends(first: 1) {\n    edges {\n      cursor\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1beb440e4acb521e6c2519a439b43898";
}

module.exports = node;
