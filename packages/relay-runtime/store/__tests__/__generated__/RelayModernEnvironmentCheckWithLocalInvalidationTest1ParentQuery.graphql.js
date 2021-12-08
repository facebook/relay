/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ef9b6a9615f0158539c1ec4fddab8e1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$variables = {|
  size: $ReadOnlyArray<?number>,
|};
export type RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQueryVariables = RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$variables;
export type RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQueryResponse = RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$data;
export type RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery = {|
  variables: RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQueryVariables,
  response: RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$data,
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
v1 = [
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
        "name": "id",
        "storageKey": null
      },
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f1351fcb2d3c94223a741d61556ea616",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery(\n  $size: [Int]!\n) {\n  me {\n    id\n    name\n    profilePicture(size: $size) {\n      uri\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "77bacd5e539f8002e558736260042f8c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$variables,
  RelayModernEnvironmentCheckWithLocalInvalidationTest1ParentQuery$data,
>*/);
