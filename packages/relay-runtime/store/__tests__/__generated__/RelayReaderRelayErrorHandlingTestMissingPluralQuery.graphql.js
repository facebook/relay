/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0952e46c01e925f5f9d6d46a37b10f66>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestMissingPluralQuery$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReaderRelayErrorHandlingTestMissingPluralQuery$data = {|
  +nodes: ?$ReadOnlyArray<?{|
    +lastName: ?string,
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |}>,
|};
export type RelayReaderRelayErrorHandlingTestMissingPluralQuery = {|
  response: RelayReaderRelayErrorHandlingTestMissingPluralQuery$data,
  variables: RelayReaderRelayErrorHandlingTestMissingPluralQuery$variables,
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
  "name": "lastName",
  "storageKey": null
},
v2 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTestMissingPluralQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/)
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
    "name": "RelayReaderRelayErrorHandlingTestMissingPluralQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          (v2/*: any*/),
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
    "cacheID": "17bef05ba3a737b778497587e3c4bb6c",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestMissingPluralQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestMissingPluralQuery(\n  $size: [Int]\n) {\n  nodes {\n    __typename\n    lastName\n    profilePicture(size: $size) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9e91ce9da23ac341e9d3815c9f9cf2f2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestMissingPluralQuery$variables,
  RelayReaderRelayErrorHandlingTestMissingPluralQuery$data,
>*/);
