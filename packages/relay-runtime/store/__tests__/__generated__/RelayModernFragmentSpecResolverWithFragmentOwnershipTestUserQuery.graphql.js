/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bf488f48482181a7f263012bb88722bc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType = any;
type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType = any;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$variables = {|
  id: string,
  size?: ?$ReadOnlyArray<?number>,
  fetchSize: boolean,
|};
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQueryVariables = RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$variables;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType & RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
  |},
|};
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQueryResponse = RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$data;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery = {|
  variables: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQueryVariables,
  response: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$data,
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
    "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery",
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
            "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment"
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
    "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
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
    "cacheID": "b71e6a9ae10b0d558078f4c094133620",
    "id": null,
    "metadata": {},
    "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery(\n  $id: ID!\n  $size: [Int]\n  $fetchSize: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment\n    ...RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment\n    id\n  }\n}\n\nfragment RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment on User {\n  username\n}\n\nfragment RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $fetchSize) {\n    uri\n  }\n  ...RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment\n}\n\nfragment RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $fetchSize) {\n    uri\n  }\n  ...RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0ac3466c6ebc673ebbcfbbf5e1fead2b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$variables,
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserQuery$data,
>*/);
