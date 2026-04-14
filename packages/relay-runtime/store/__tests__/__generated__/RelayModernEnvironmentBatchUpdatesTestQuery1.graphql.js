/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c692559d10c997cde2cd75c4255084d0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentBatchUpdatesTestQuery1$variables = {||};
export type RelayModernEnvironmentBatchUpdatesTestQuery1$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentBatchUpdatesTestQuery1 = {|
  response: RelayModernEnvironmentBatchUpdatesTestQuery1$data,
  variables: RelayModernEnvironmentBatchUpdatesTestQuery1$variables,
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
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery1",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/)
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
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery1",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
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
    "cacheID": "73b4b408e3964d004cc6bdfbcb0b8840",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery1",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentBatchUpdatesTestQuery1 {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "c9749ecf0c0c8658fe01b6f902312c46";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentBatchUpdatesTestQuery1$variables,
  RelayModernEnvironmentBatchUpdatesTestQuery1$data,
>*/);
