/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7c91e91c0d5f062ffbe2fe0c139f3f6e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type ReactRelayLocalQueryRendererTestSecondUserQuery$variables = {|
  id?: ?string,
|};
export type ReactRelayLocalQueryRendererTestSecondUserQuery$data = {|
  +node: ?{|
    +id: string,
    +lastName?: ?string,
  |},
|};
export type ReactRelayLocalQueryRendererTestSecondUserQuery = {|
  response: ReactRelayLocalQueryRendererTestSecondUserQuery$data,
  variables: ReactRelayLocalQueryRendererTestSecondUserQuery$variables,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayLocalQueryRendererTestSecondUserQuery",
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
          (v3/*: any*/)
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
    "name": "ReactRelayLocalQueryRendererTestSecondUserQuery",
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
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "30b873fb8d5fdabfc73aeb72e7dbf2ba",
    "id": null,
    "metadata": {},
    "name": "ReactRelayLocalQueryRendererTestSecondUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayLocalQueryRendererTestSecondUserQuery(\n  $id: ID = \"<default>\"\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on User {\n      lastName\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5716979e899ac67be87af3d3d3533a98";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayLocalQueryRendererTestSecondUserQuery$variables,
  ReactRelayLocalQueryRendererTestSecondUserQuery$data,
>*/);
