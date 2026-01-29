/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<08e3a35a1ab1ae3d9c5b726e1c6e2fdb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType } from "./RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment.graphql";
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$variables = {|
  size: ReadonlyArray<?number>,
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery = {|
  response: RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$data,
  variables: RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$variables,
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
    "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery",
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
                "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment"
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
    "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery",
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
            "label": "RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment",
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
    "cacheID": "f7fa7109619ccd688470e864aeb009e9",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery(\n  $size: [Int]!\n) {\n  me {\n    id\n    name\n    ...RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment @defer(label: \"RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment\")\n  }\n}\n\nfragment RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment on User {\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a8ccb92b8e2653a27d1d12558fe72ee4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$variables,
  RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$data,
>*/);
