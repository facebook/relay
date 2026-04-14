/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<27e98e549ecbec80bb8608ccd390043b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest19Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest19Query$data = {|
  +node: ?{|
    +__typename: string,
    +actors?: ?ReadonlyArray<?{|
      +__typename: string,
      +id: string,
      +name: ?string,
    |}>,
    +id: string,
  |},
|};
export type RelayResponseNormalizerTest19Query = {|
  response: RelayResponseNormalizerTest19Query$data,
  variables: RelayResponseNormalizerTest19Query$variables,
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              (v2/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "type": "User",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest19Query",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest19Query",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "7a82d3b2aa987f8dad4ee554d97d4974",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest19Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest19Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actors {\n        id\n        name\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "d5fa662de5d0ba3855a8566d08eab440";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest19Query$variables,
  RelayResponseNormalizerTest19Query$data,
>*/);
