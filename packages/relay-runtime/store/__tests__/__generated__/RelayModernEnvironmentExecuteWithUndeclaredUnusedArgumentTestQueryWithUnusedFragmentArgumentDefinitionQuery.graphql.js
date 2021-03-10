/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3aae0639fc91cf89662c261fbbd93f6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref = any;
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQueryVariables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile$ref,
  |},
|};
export type RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQuery = {|
  variables: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQueryVariables,
  response: RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQueryResponse,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile"
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
    "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                "args": [
                  {
                    "kind": "Literal",
                    "name": "size",
                    "value": [
                      100
                    ]
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
                "storageKey": "profilePicture(size:[100])"
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
    "cacheID": "6ba2737544d05afb9921b9c3c2ff299e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile on User {\n  id\n  name\n  ...RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper_18PEfK\n}\n\nfragment RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper_18PEfK on User {\n  __typename\n  ...RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto_18PEfK\n}\n\nfragment RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto_18PEfK on User {\n  profilePicture(size: [100]) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "00358e8069835783f936954905b1cf85";
}

module.exports = node;
