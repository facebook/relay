/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bd705c1a40bce07f7407097d481160b0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentCommitUpdateTestParentQuery$variables = {||};
export type RelayModernEnvironmentCommitUpdateTestParentQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentCommitUpdateTestParentQuery = {|
  response: RelayModernEnvironmentCommitUpdateTestParentQuery$data,
  variables: RelayModernEnvironmentCommitUpdateTestParentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCommitUpdateTestParentQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentCommitUpdateTestParentQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "bd4517def97dc3ebf363f8887f96cd3e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCommitUpdateTestParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCommitUpdateTestParentQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f4e78cf9f500660c2caaac5c0c05f547";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCommitUpdateTestParentQuery$variables,
  RelayModernEnvironmentCommitUpdateTestParentQuery$data,
>*/);
