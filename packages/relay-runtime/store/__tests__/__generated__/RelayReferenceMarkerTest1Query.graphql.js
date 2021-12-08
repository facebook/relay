/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<443edd34a5a36211bea1fedafc740644>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReferenceMarkerTest1Fragment$fragmentType = any;
export type RelayReferenceMarkerTest1Query$variables = {|
  id?: ?string,
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReferenceMarkerTest1QueryVariables = RelayReferenceMarkerTest1Query$variables;
export type RelayReferenceMarkerTest1Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +actors?: ?$ReadOnlyArray<?{|
      +name: ?string,
    |}>,
    +$fragmentSpreads: RelayReferenceMarkerTest1Fragment$fragmentType,
  |},
|};
export type RelayReferenceMarkerTest1QueryResponse = RelayReferenceMarkerTest1Query$data;
export type RelayReferenceMarkerTest1Query = {|
  variables: RelayReferenceMarkerTest1QueryVariables,
  response: RelayReferenceMarkerTest1Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
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
  "name": "name",
  "storageKey": null
},
v5 = [
  {
    "kind": "Variable",
    "name": "size",
    "variableName": "size"
  }
],
v6 = {
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
    "name": "RelayReferenceMarkerTest1Query",
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
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actors",
                "plural": true,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          {
            "args": (v5/*: any*/),
            "kind": "FragmentSpread",
            "name": "RelayReferenceMarkerTest1Fragment"
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
    "name": "RelayReferenceMarkerTest1Query",
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
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actors",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v6/*: any*/),
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
                          (v2/*: any*/),
                          (v6/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "friends(first:3)"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profilePicture",
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
                "storageKey": null
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
    "cacheID": "0461fde0ded5e50a005907b4f686bc98",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest1Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest1Query(\n  $id: ID\n  $size: [Int]\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on Page {\n      actors {\n        __typename\n        name\n        id\n      }\n    }\n    ...RelayReferenceMarkerTest1Fragment_18PEfK\n  }\n}\n\nfragment RelayReferenceMarkerTest1Fragment_18PEfK on User {\n  firstName\n  friends(first: 3) {\n    edges {\n      cursor\n      node {\n        id\n        firstName\n      }\n    }\n  }\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c93bd2646732b404b960bb12692d825a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest1Query$variables,
  RelayReferenceMarkerTest1Query$data,
>*/);
