/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5140b561c9c87921fda999cad6fe25b3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernStoreSubscriptionGCTestFriendsFragment$fragmentType } from "./RelayModernStoreSubscriptionGCTestFriendsFragment.graphql";
import type { RelayModernStoreSubscriptionGCTestUserFragment$fragmentType } from "./RelayModernStoreSubscriptionGCTestUserFragment.graphql";
export type RelayModernStoreSubscriptionGCTestOwnerQuery$variables = {
  id: string,
};
export type RelayModernStoreSubscriptionGCTestOwnerQuery$data = {
  readonly node: ?{
    readonly $fragmentSpreads: RelayModernStoreSubscriptionGCTestFriendsFragment$fragmentType & RelayModernStoreSubscriptionGCTestUserFragment$fragmentType,
  },
};
export type RelayModernStoreSubscriptionGCTestOwnerQuery = {
  response: RelayModernStoreSubscriptionGCTestOwnerQuery$data,
  variables: RelayModernStoreSubscriptionGCTestOwnerQuery$variables,
};
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
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreSubscriptionGCTestOwnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernStoreSubscriptionGCTestUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernStoreSubscriptionGCTestFriendsFragment"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernStoreSubscriptionGCTestOwnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Date",
                "kind": "LinkedField",
                "name": "birthdate",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "day",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
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
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v3/*:: as any*/),
                          (v2/*:: as any*/)
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
            "type": "User",
            "abstractKey": null
          },
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ab20c35f9b32bd660340c3e612dcc8e9",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreSubscriptionGCTestOwnerQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreSubscriptionGCTestOwnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernStoreSubscriptionGCTestUserFragment\n    ...RelayModernStoreSubscriptionGCTestFriendsFragment\n    id\n  }\n}\n\nfragment RelayModernStoreSubscriptionGCTestFriendsFragment on User {\n  friends(first: 1) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n\nfragment RelayModernStoreSubscriptionGCTestUserFragment on User {\n  name\n  birthdate {\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "1b30ec2f4928d0968851e0532059df43";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernStoreSubscriptionGCTestOwnerQuery$variables,
  RelayModernStoreSubscriptionGCTestOwnerQuery$data,
>*/);
