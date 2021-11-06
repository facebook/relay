/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<83af292a4717ebb3d26e278975e136af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$ref = any;
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserQueryVariables = {|
  id: string,
  scale: number,
|};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment$ref,
  |},
|};
export type ReactRelayRefetchContainerWithFragmentOwnershipTestUserQuery = {|
  variables: ReactRelayRefetchContainerWithFragmentOwnershipTestUserQueryVariables,
  response: ReactRelayRefetchContainerWithFragmentOwnershipTestUserQueryResponse,
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
    "name": "scale"
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
    "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserQuery",
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
            "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment"
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
    "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserQuery",
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
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "scale"
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
    "cacheID": "bf22e7e19e212cbdea962863864a2723",
    "id": null,
    "metadata": {},
    "name": "ReactRelayRefetchContainerWithFragmentOwnershipTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayRefetchContainerWithFragmentOwnershipTestUserQuery(\n  $id: ID!\n  $scale: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment\n    id\n  }\n}\n\nfragment ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n  ...ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment_22eGLd\n}\n\nfragment ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment_22eGLd on User {\n  id\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "226c6570b64b74227f1cd9b069e9815e";
}

module.exports = node;
