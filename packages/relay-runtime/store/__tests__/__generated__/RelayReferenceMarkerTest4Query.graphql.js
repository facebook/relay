/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1a9913abc914cfc18112ae2d38b442d0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReferenceMarkerTest2Fragment$fragmentType = any;
export type RelayReferenceMarkerTest4Query$variables = {|
  id?: ?string,
|};
export type RelayReferenceMarkerTest4QueryVariables = RelayReferenceMarkerTest4Query$variables;
export type RelayReferenceMarkerTest4Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +$fragmentSpreads: RelayReferenceMarkerTest2Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest4QueryResponse = RelayReferenceMarkerTest4Query$data;
export type RelayReferenceMarkerTest4Query = {|
  variables: RelayReferenceMarkerTest4QueryVariables,
  response: RelayReferenceMarkerTest4Query$data,
|};
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTest4Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReferenceMarkerTest2Fragment"
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
    "name": "RelayReferenceMarkerTest4Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
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
                              (v2/*: any*/),
                              (v4/*: any*/)
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "469e96cb099ea95194e55d42ff8a376d",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest4Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest4Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ...RelayReferenceMarkerTest2Fragment\n  }\n}\n\nfragment RelayReferenceMarkerTest2Fragment on User {\n  firstName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c0a1e569d98cf3c0c2b4a559325ed687";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest4Query$variables,
  RelayReferenceMarkerTest4Query$data,
>*/);
