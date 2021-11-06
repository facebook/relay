/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a84815caf8f4f925c634f9916664e7f0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayModernEnvironmentApplyUpdateTestParentQueryVariables = {||};
export type RelayModernEnvironmentApplyUpdateTestParentQueryResponse = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentApplyUpdateTestParentQuery = {|
  variables: RelayModernEnvironmentApplyUpdateTestParentQueryVariables,
  response: RelayModernEnvironmentApplyUpdateTestParentQueryResponse,
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
    "name": "RelayModernEnvironmentApplyUpdateTestParentQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentApplyUpdateTestParentQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "f4b45974ff188d52db320fa51dbd4f28",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentApplyUpdateTestParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentApplyUpdateTestParentQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8448bd921a02af1b82ac602808b5eb14";
}

module.exports = node;
