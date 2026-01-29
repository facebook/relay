/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b24edc467570e537ee929f246013323f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernStoreSubscriptionsTest2Fragment$fragmentType } from "./RelayModernStoreSubscriptionsTest2Fragment.graphql";
export type RelayModernStoreSubscriptionsTest2Query$variables = {|
  size: ReadonlyArray<?number>,
|};
export type RelayModernStoreSubscriptionsTest2Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernStoreSubscriptionsTest2Fragment$fragmentType,
  |},
|};
export type RelayModernStoreSubscriptionsTest2Query = {|
  response: RelayModernStoreSubscriptionsTest2Query$data,
  variables: RelayModernStoreSubscriptionsTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreSubscriptionsTest2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernStoreSubscriptionsTest2Fragment"
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
    "name": "RelayModernStoreSubscriptionsTest2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "emailAddresses",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0d3570609eba564b448f538065369b05",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreSubscriptionsTest2Query",
    "operationKind": "query",
    "text": "query RelayModernStoreSubscriptionsTest2Query(\n  $size: [Int]!\n) {\n  me {\n    ...RelayModernStoreSubscriptionsTest2Fragment\n    id\n  }\n}\n\nfragment RelayModernStoreSubscriptionsTest2Fragment on User {\n  name\n  profilePicture(size: $size) {\n    uri\n  }\n  emailAddresses\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9db1348253b1c78ad303e60af98bc7d1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreSubscriptionsTest2Query$variables,
  RelayModernStoreSubscriptionsTest2Query$data,
>*/);
