/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6cb382d4edf88bb381fdf0d1fc72eb6c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceTest6Fragment$fragmentType = any;
export type FragmentResourceTest6Query$variables = {|
  id: string,
  foo: boolean,
|};
export type FragmentResourceTest6QueryVariables = FragmentResourceTest6Query$variables;
export type FragmentResourceTest6Query$data = {|
  +node: ?{|
    +__typename: string,
    +name?: ?string,
    +$fragmentSpreads: FragmentResourceTest6Fragment$fragmentType,
  |},
|};
export type FragmentResourceTest6QueryResponse = FragmentResourceTest6Query$data;
export type FragmentResourceTest6Query = {|
  variables: FragmentResourceTest6QueryVariables,
  response: FragmentResourceTest6Query$data,
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
  "selections": (v4/*: any*/)
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/),
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FragmentResourceTest6Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": (v4/*: any*/),
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
  (node/*: any*/).hash = "6729d563666fcfaad04fef9ac67fe82f";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest6Query$variables,
  FragmentResourceTest6Query$data,
>*/);
