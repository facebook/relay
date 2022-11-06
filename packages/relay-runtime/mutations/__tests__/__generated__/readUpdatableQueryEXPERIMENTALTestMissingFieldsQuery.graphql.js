/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3fcf865512e0e94843d07f3d5f999670>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery$variables = {||};
export type readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery = {|
  response: readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery$data,
  variables: readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "a40cab9ddbd355f3b2bf5e68811568e2",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e5884201f48d9f74be4354e1ad95278b";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery$variables,
  readUpdatableQueryEXPERIMENTALTestMissingFieldsQuery$data,
>*/);
