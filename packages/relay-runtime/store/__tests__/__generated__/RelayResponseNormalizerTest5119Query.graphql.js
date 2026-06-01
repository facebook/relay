/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d6fd649e757863f10143a50deeb232a7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayResponseNormalizerTest5119NoSkipFragment$fragmentType } from "./RelayResponseNormalizerTest5119NoSkipFragment.graphql";
import type { RelayResponseNormalizerTest5119SkipFragment$fragmentType } from "./RelayResponseNormalizerTest5119SkipFragment.graphql";
export type RelayResponseNormalizerTest5119Query$variables = {|
  id?: ?string,
  skip: boolean,
|};
export type RelayResponseNormalizerTest5119Query$data = {|
  +node: ?{|
    +__typename: string,
    +id: string,
    +$fragmentSpreads: RelayResponseNormalizerTest5119NoSkipFragment$fragmentType & RelayResponseNormalizerTest5119SkipFragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest5119Query = {|
  response: RelayResponseNormalizerTest5119Query$data,
  variables: RelayResponseNormalizerTest5119Query$variables,
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
    "name": "skip"
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
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest5119Query",
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
          (v3/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": [
                  {
                    "kind": "Variable",
                    "name": "skip",
                    "variableName": "skip"
                  }
                ],
                "kind": "FragmentSpread",
                "name": "RelayResponseNormalizerTest5119SkipFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayResponseNormalizerTest5119NoSkipFragment"
              }
            ],
            "type": "User",
            "abstractKey": null
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
    "name": "RelayResponseNormalizerTest5119Query",
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
          (v3/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "firstName",
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
    "cacheID": "5d9dfab578b1dcd5c40e83d84cd821ae",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest5119Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest5119Query(\n  $id: ID\n  $skip: Boolean!\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      ...RelayResponseNormalizerTest5119SkipFragment_qfE4l\n      ...RelayResponseNormalizerTest5119NoSkipFragment\n    }\n  }\n}\n\nfragment RelayResponseNormalizerTest5119NoSkipFragment on User {\n  firstName\n}\n\nfragment RelayResponseNormalizerTest5119SkipFragment_qfE4l on User {\n  firstName @skip(if: $skip)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "b5111ffaf61794ddb2b0e0e425f931da";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest5119Query$variables,
  RelayResponseNormalizerTest5119Query$data,
>*/);
