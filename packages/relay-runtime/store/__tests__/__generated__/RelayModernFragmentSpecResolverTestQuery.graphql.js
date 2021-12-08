/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ccd3f204ccd20e7d91f8d393b3debbb0>>
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
export type RelayModernFragmentSpecResolverTestQuery$variables = {|
  id: string,
  size?: ?$ReadOnlyArray<?number>,
  fetchSize: boolean,
|};
export type RelayModernFragmentSpecResolverTestQueryVariables = RelayModernFragmentSpecResolverTestQuery$variables;
export type RelayModernFragmentSpecResolverTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernFragmentSpecResolverTestQueryUserFragment$fragmentType & RelayModernFragmentSpecResolverTestQueryUsersFragment$fragmentType,
  |},
|};
export type RelayModernFragmentSpecResolverTestQueryResponse = RelayModernFragmentSpecResolverTestQuery$data;
export type RelayModernFragmentSpecResolverTestQuery = {|
  variables: RelayModernFragmentSpecResolverTestQueryVariables,
  response: RelayModernFragmentSpecResolverTestQuery$data,
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
    "name": "RelayModernFragmentSpecResolverTestQuery",
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
    "name": "RelayModernFragmentSpecResolverTestQuery",
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
    "cacheID": "927041e646430203d20ec438187293e0",
    "id": null,
    "metadata": {},
    "name": "RelayModernFragmentSpecResolverTestQuery",
    "operationKind": "query",
    "text": "query RelayModernFragmentSpecResolverTestQuery(\n  $id: ID!\n  $size: [Int]\n  $fetchSize: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernFragmentSpecResolverTestQueryUserFragment\n    ...RelayModernFragmentSpecResolverTestQueryUsersFragment\n    id\n  }\n}\n\nfragment RelayModernFragmentSpecResolverTestQueryUserFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $fetchSize) {\n    uri\n  }\n}\n\nfragment RelayModernFragmentSpecResolverTestQueryUsersFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $fetchSize) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "861d571e1856374cfbff7ce6564c306c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernFragmentSpecResolverTestQuery$variables,
  RelayModernFragmentSpecResolverTestQuery$data,
>*/);
