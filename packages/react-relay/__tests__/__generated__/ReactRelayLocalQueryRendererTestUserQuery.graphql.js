/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2cdd2265607b48f4252e86d5090df363>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayLocalQueryRendererTestUserFragment$fragmentType = any;
export type ReactRelayLocalQueryRendererTestUserQuery$variables = {|
  id?: ?string,
|};
export type ReactRelayLocalQueryRendererTestUserQueryVariables = ReactRelayLocalQueryRendererTestUserQuery$variables;
export type ReactRelayLocalQueryRendererTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +lastName?: ?string,
    +$fragmentSpreads: ReactRelayLocalQueryRendererTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayLocalQueryRendererTestUserQueryResponse = ReactRelayLocalQueryRendererTestUserQuery$data;
export type ReactRelayLocalQueryRendererTestUserQuery = {|
  variables: ReactRelayLocalQueryRendererTestUserQueryVariables,
  response: ReactRelayLocalQueryRendererTestUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": "<default>",
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
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayLocalQueryRendererTestUserQuery",
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
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReactRelayLocalQueryRendererTestUserFragment"
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
    "name": "ReactRelayLocalQueryRendererTestUserQuery",
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
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
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
    "cacheID": "f76cddbafdc488956a27a7ae06a5f173",
    "id": null,
    "metadata": {},
    "name": "ReactRelayLocalQueryRendererTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayLocalQueryRendererTestUserQuery(\n  $id: ID = \"<default>\"\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on User {\n      lastName\n    }\n    ...ReactRelayLocalQueryRendererTestUserFragment\n  }\n}\n\nfragment ReactRelayLocalQueryRendererTestUserFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f46ad8fa64eb4b5933ed039b4cc94e16";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayLocalQueryRendererTestUserQuery$variables,
  ReactRelayLocalQueryRendererTestUserQuery$data,
>*/);
