/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ae064e52237c0ba0536ef06ccae46845>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import type { useRefetchableFragmentNodeTestIdentityTestFragment$fragmentType } from "./useRefetchableFragmentNodeTestIdentityTestFragment.graphql";
export type useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$variables = {|
  id: string,
  scale?: ?number,
|};
export type useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useRefetchableFragmentNodeTestIdentityTestFragment$fragmentType,
  |},
|};
export type useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery = {|
  response: useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$data,
  variables: useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scale"
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
    "name": "useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "useRefetchableFragmentNodeTestIdentityTestFragment"
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
    "name": "useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
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
    "cacheID": "56cdd0ad080963adb4022f3886d0a160",
    "id": null,
    "metadata": {},
    "name": "useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery",
    "operationKind": "query",
    "text": "query useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery(\n  $scale: Float\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useRefetchableFragmentNodeTestIdentityTestFragment\n    id\n  }\n}\n\nfragment useRefetchableFragmentNodeTestIdentityTestFragment on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0b309ceb5fea8ea44abb827cce31328b";
}

module.exports = ((node/*: any*/)/*: Query<
  useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$variables,
  useRefetchableFragmentNodeTestIdentityTestFragmentRefetchQuery$data,
>*/);
