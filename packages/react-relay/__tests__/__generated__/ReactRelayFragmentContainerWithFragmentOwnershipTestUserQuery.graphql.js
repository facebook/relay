/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5bdfff4f6414bb93b96d0a81e8bd3c1c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$ref = any;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestUserQueryVariables = {|
  id: string,
|};
export type ReactRelayFragmentContainerWithFragmentOwnershipTestUserQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$ref,
  |},
|};
export type ReactRelayFragmentContainerWithFragmentOwnershipTestUserQuery = {|
  variables: ReactRelayFragmentContainerWithFragmentOwnershipTestUserQueryVariables,
  response: ReactRelayFragmentContainerWithFragmentOwnershipTestUserQueryResponse,
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
    "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestUserQuery",
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
            "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment"
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
    "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestUserQuery",
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
                "args": null,
                "kind": "ScalarField",
                "name": "username",
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
    "cacheID": "19bfce3ae60f6f1667c7e8e74ab462ec",
    "id": null,
    "metadata": {},
    "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayFragmentContainerWithFragmentOwnershipTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment\n    id\n  }\n}\n\nfragment ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment on User {\n  username\n}\n\nfragment ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment on User {\n  id\n  name\n  ...ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "20539d35a38e31c9ccbdd6b4d54aec21";
}

module.exports = node;
