/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e93814063347a378f5995dd46157a87d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayLocalQueryRendererTestUserFragment$fragmentType } from "./ReactRelayLocalQueryRendererTestUserFragment.graphql";
export type ReactRelayLocalQueryRendererTestUserQuery$variables = {|
  id?: ?string,
|};
export type ReactRelayLocalQueryRendererTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +lastName?: ?string,
    +$fragmentSpreads: ReactRelayLocalQueryRendererTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayLocalQueryRendererTestUserQuery = {|
  response: ReactRelayLocalQueryRendererTestUserQuery$data,
  variables: ReactRelayLocalQueryRendererTestUserQuery$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayLocalQueryRendererTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ReactRelayLocalQueryRendererTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
          (v2/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*:: as any*/),
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
  (node/*:: as any*/).hash = "24c704b361b5a05121618dff23ef81f9";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ReactRelayLocalQueryRendererTestUserQuery$variables,
  ReactRelayLocalQueryRendererTestUserQuery$data,
>*/);
