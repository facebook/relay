/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<85b8cc101bb9e081bcb78f037c812e16>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$ref = any;
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQueryVariables = {|
  size: $ReadOnlyArray<?number>,
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQueryResponse = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +$fragmentRefs: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$ref,
  |},
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery = {|
  variables: RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQueryVariables,
  response: RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQueryResponse,
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

module.exports = node;
