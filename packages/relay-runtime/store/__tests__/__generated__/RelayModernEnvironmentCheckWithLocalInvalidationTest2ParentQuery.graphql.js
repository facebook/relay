/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e4b2e309ac325bb8e47ec5d68d10715b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType } from "./RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment.graphql";
export type RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$variables = {|
  size: ReadonlyArray<?number>,
|};
export type RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery = {|
  response: RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$data,
  variables: RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
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
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment"
              }
            ]
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
    "name": "RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$defer$UserFragment",
            "selections": [
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "size",
                    "variableName": "size"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profilePicture",
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
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cf8f0bc9863a370210bd3d598506bd59",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery(\n  $size: [Int]!\n) {\n  me {\n    id\n    name\n    ...RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment @defer(label: \"RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$defer$UserFragment\")\n  }\n}\n\nfragment RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment on User {\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ca78599dc4e3d1312e5ed2be59582742";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$variables,
  RelayModernEnvironmentCheckWithLocalInvalidationTest2ParentQuery$data,
>*/);
