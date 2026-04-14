/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b61051ddbfd7c3c29f84451a8d39bee5>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceTest6Fragment$fragmentType } from "./FragmentResourceTest6Fragment.graphql";
export type FragmentResourceTest6Query$variables = {|
  foo: boolean,
  id: string,
|};
export type FragmentResourceTest6Query$data = {|
  +node: ?{|
    +__typename: string,
    +name?: ?string,
    +$fragmentSpreads: FragmentResourceTest6Fragment$fragmentType,
  |},
|};
export type FragmentResourceTest6Query = {|
  response: FragmentResourceTest6Query$data,
  variables: FragmentResourceTest6Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "foo"
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
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v5 = {
  "condition": "foo",
  "kind": "Condition",
  "passingValue": true,
  "selections": (v4/*:: as any*/)
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v5/*:: as any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FragmentResourceTest6Fragment"
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
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "FragmentResourceTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          (v5/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": (v4/*:: as any*/),
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d7b8504153f6ea413139dfb9b14df5f8",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceTest6Query",
    "operationKind": "query",
    "text": "query FragmentResourceTest6Query(\n  $id: ID!\n  $foo: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    name @include(if: $foo)\n    ...FragmentResourceTest6Fragment\n    id\n  }\n}\n\nfragment FragmentResourceTest6Fragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "b3516b8d8ace6d328f7c9b16fbbd16e7";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  FragmentResourceTest6Query$variables,
  FragmentResourceTest6Query$data,
>*/);
