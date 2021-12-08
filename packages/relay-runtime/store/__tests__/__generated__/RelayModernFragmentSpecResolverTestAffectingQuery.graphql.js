/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<db99977e7cfedab95234d229277874db>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernFragmentSpecResolverTestQueryUserFragment$fragmentType = any;
type RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType = any;
export type RelayModernFragmentSpecResolverTestAffectingQuery$variables = {|
  id: string,
  size?: ?$ReadOnlyArray<?number>,
  fetchSize: boolean,
|};
export type RelayModernFragmentSpecResolverTestAffectingQueryVariables = RelayModernFragmentSpecResolverTestAffectingQuery$variables;
export type RelayModernFragmentSpecResolverTestAffectingQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernFragmentSpecResolverTestQueryUserFragment$fragmentType & RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType,
  |},
|};
export type RelayModernFragmentSpecResolverTestAffectingQueryResponse = RelayModernFragmentSpecResolverTestAffectingQuery$data;
export type RelayModernFragmentSpecResolverTestAffectingQuery = {|
  variables: RelayModernFragmentSpecResolverTestAffectingQueryVariables,
  response: RelayModernFragmentSpecResolverTestAffectingQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "fetchSize"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "size"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernFragmentSpecResolverTestAffectingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernFragmentSpecResolverTestQueryUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernFragmentSpecResolverTestQueryUsersFragment"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayModernFragmentSpecResolverTestAffectingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "condition": "fetchSize",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
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
    "cacheID": "ebf5baaa931c2f7f420c731b23a5b01f",
    "id": null,
    "metadata": {},
    "name": "RelayModernFragmentSpecResolverTestAffectingQuery",
    "operationKind": "query",
    "text": "query RelayModernFragmentSpecResolverTestAffectingQuery(\n  $id: ID!\n  $size: [Int]\n  $fetchSize: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernFragmentSpecResolverTestQueryUserFragment\n    ...RelayModernFragmentSpecResolverTestQueryUsersFragment\n    id\n  }\n}\n\nfragment RelayModernFragmentSpecResolverTestQueryUserFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $fetchSize) {\n    uri\n  }\n}\n\nfragment RelayModernFragmentSpecResolverTestQueryUsersFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $fetchSize) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ded358125ddc82c32d526451fd5f1a0e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernFragmentSpecResolverTestAffectingQuery$variables,
  RelayModernFragmentSpecResolverTestAffectingQuery$data,
>*/);
