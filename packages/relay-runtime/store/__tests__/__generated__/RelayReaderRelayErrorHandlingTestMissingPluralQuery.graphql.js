/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a2f1f47e404e791365a099a51538e240>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestMissingPluralQuery$variables = {|
  size?: ?ReadonlyArray<?number>,
|};
export type RelayReaderRelayErrorHandlingTestMissingPluralQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
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
    "argumentDefinitions": (v0/*:: as any*/),
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
          (v1/*:: as any*/),
          (v2/*:: as any*/)
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
          (v1/*:: as any*/),
          (v2/*:: as any*/),
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
  (node/*:: as any*/).hash = "9e91ce9da23ac341e9d3815c9f9cf2f2";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRelayErrorHandlingTestMissingPluralQuery$variables,
  RelayReaderRelayErrorHandlingTestMissingPluralQuery$data,
>*/);
