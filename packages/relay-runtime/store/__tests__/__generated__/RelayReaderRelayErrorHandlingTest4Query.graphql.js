/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<38de2053480692df4991c07c54d62556>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTest4Query$variables = {|
  size?: ?ReadonlyArray<?number>,
|};
export type RelayReaderRelayErrorHandlingTest4Query$data = {|
  +me: ?{|
    +lastName: ?string,
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayReaderRelayErrorHandlingTest4Query = {|
  response: RelayReaderRelayErrorHandlingTest4Query$data,
  variables: RelayReaderRelayErrorHandlingTest4Query$variables,
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
    "name": "RelayReaderRelayErrorHandlingTest4Query",
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
    "name": "RelayReaderRelayErrorHandlingTest4Query",
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
    "cacheID": "7e100d27fcbf7ae4b026630b6ea29858",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTest4Query",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTest4Query(\n  $size: [Int]\n) {\n  me {\n    lastName\n    profilePicture(size: $size) {\n      uri\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1ae3c1ad76037701e8a11bdbe47a36e1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTest4Query$variables,
  RelayReaderRelayErrorHandlingTest4Query$data,
>*/);
