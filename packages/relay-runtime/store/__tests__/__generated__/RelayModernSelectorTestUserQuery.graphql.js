/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bef5c649c9ee9407fce983508e5002fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernSelectorTestUserFragment$fragmentType = any;
type RelayModernSelectorTestUsersFragment$fragmentType = any;
export type RelayModernSelectorTestUserQuery$variables = {|
  id: string,
  size?: ?$ReadOnlyArray<?number>,
  cond: boolean,
|};
export type RelayModernSelectorTestUserQueryVariables = RelayModernSelectorTestUserQuery$variables;
export type RelayModernSelectorTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernSelectorTestUserFragment$fragmentType & RelayModernSelectorTestUsersFragment$fragmentType,
  |},
|};
export type RelayModernSelectorTestUserQueryResponse = RelayModernSelectorTestUserQuery$data;
export type RelayModernSelectorTestUserQuery = {|
  variables: RelayModernSelectorTestUserQueryVariables,
  response: RelayModernSelectorTestUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cond"
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
    "name": "RelayModernSelectorTestUserQuery",
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
            "name": "RelayModernSelectorTestUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernSelectorTestUsersFragment"
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
    "name": "RelayModernSelectorTestUserQuery",
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
                "condition": "cond",
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
    "cacheID": "ff14fc374a9b5725c7b45e145387b849",
    "id": null,
    "metadata": {},
    "name": "RelayModernSelectorTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernSelectorTestUserQuery(\n  $id: ID!\n  $size: [Int]\n  $cond: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernSelectorTestUserFragment\n    ...RelayModernSelectorTestUsersFragment\n    id\n  }\n}\n\nfragment RelayModernSelectorTestUserFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $cond) {\n    uri\n  }\n}\n\nfragment RelayModernSelectorTestUsersFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $cond) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "afbaf504a28e027de34401ff4a82e567";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernSelectorTestUserQuery$variables,
  RelayModernSelectorTestUserQuery$data,
>*/);
