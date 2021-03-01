/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ca8930030a82bff9ecd7695c8db5c586>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernSelectorTestUserFragment$ref = any;
type RelayModernSelectorTestUsersFragment$ref = any;
export type RelayModernSelectorTestUserQueryVariables = {|
  id: string,
  size?: ?number,
  cond: boolean,
|};
export type RelayModernSelectorTestUserQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: RelayModernSelectorTestUserFragment$ref & RelayModernSelectorTestUsersFragment$ref,
  |},
|};
export type RelayModernSelectorTestUserQuery = {|
  variables: RelayModernSelectorTestUserQueryVariables,
  response: RelayModernSelectorTestUserQueryResponse,
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
    "cacheID": "555c7d35fd9d940d0fe8f33bd3e924d1",
    "id": null,
    "metadata": {},
    "name": "RelayModernSelectorTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernSelectorTestUserQuery(\n  $id: ID!\n  $size: Int\n  $cond: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernSelectorTestUserFragment\n    ...RelayModernSelectorTestUsersFragment\n    id\n  }\n}\n\nfragment RelayModernSelectorTestUserFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $cond) {\n    uri\n  }\n}\n\nfragment RelayModernSelectorTestUsersFragment on User {\n  id\n  name\n  profilePicture(size: $size) @include(if: $cond) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a1c4660072809c07ccdb440e3eec35e7";
}

module.exports = node;
