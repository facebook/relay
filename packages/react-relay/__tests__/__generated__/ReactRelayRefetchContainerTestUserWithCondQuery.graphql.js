/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6073c2bb9f3f6b66e7def5d0535e10ae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ReactRelayRefetchContainerTestUserFragment$ref = any;
export type ReactRelayRefetchContainerTestUserWithCondQueryVariables = {|
  id: string,
  condGlobal: boolean,
|};
export type ReactRelayRefetchContainerTestUserWithCondQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: ReactRelayRefetchContainerTestUserFragment$ref,
  |},
|};
export type ReactRelayRefetchContainerTestUserWithCondQuery = {|
  variables: ReactRelayRefetchContainerTestUserWithCondQueryVariables,
  response: ReactRelayRefetchContainerTestUserWithCondQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "condGlobal"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayRefetchContainerTestUserWithCondQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "cond",
                "variableName": "condGlobal"
              }
            ],
            "kind": "FragmentSpread",
            "name": "ReactRelayRefetchContainerTestUserFragment"
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
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ReactRelayRefetchContainerTestUserWithCondQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                "condition": "condGlobal",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
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
    "cacheID": "1b333f7e7a646203ad3a4b04bee57b6a",
    "id": null,
    "metadata": {},
    "name": "ReactRelayRefetchContainerTestUserWithCondQuery",
    "operationKind": "query",
    "text": "query ReactRelayRefetchContainerTestUserWithCondQuery(\n  $id: ID!\n  $condGlobal: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...ReactRelayRefetchContainerTestUserFragment_1jD3FU\n    id\n  }\n}\n\nfragment ReactRelayRefetchContainerTestUserFragment_1jD3FU on User {\n  id\n  name @include(if: $condGlobal)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ec592599ed4721431b9724f76eb81196";
}

module.exports = node;
