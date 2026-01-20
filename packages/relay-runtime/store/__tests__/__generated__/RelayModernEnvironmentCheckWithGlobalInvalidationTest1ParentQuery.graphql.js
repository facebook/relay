/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<af6eee8e801384cdf672e88ec0bf83f7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery$variables = {|
  size: ReadonlyArray<?number>,
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery = {|
  response: RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery$data,
  variables: RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery$variables,
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
    "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "30e182693f9e70cc1484744d0c4dd3ba",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery(\n  $size: [Int]!\n) {\n  me {\n    id\n    name\n    profilePicture(size: $size) {\n      uri\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6b6025e9bbd2d6277cea03a606e6b573";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery$variables,
  RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery$data,
>*/);
