/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bde8efc3f1c0c65c4de5a1f8ba91750b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType } from "./RelayMockEnvironmentWithComponentsTestProminentSolutionFragment.graphql";
export type RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery$variables = {|
  id?: ?string,
  scale?: ?number,
|};
export type RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery$data = {|
  +user: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery = {|
  response: RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery$data,
  variables: RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": "<default>",
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": 1,
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
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockEnvironmentWithComponentsTestProminentSolutionFragment"
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
    "name": "RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery",
    "selections": [
      {
        "alias": "user",
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
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
    "cacheID": "2646e3ec2d1989711ee7384fa20f2dda",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery(\n  $id: ID = \"<default>\"\n  $scale: Float = 1\n) {\n  user: node(id: $id) {\n    __typename\n    id\n    name\n    ...RelayMockEnvironmentWithComponentsTestProminentSolutionFragment\n  }\n}\n\nfragment RelayMockEnvironmentWithComponentsTestProminentSolutionFragment on User {\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f76438756eb9c84ef378afca68405ae2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery$variables,
  RelayMockEnvironmentWithComponentsTestImpossibleAwesomenessQuery$data,
>*/);
