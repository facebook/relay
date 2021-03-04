/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8d8abc4833c084b07c0b81d2dbdae427>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentLookupTestChildFragment$ref = any;
export type RelayModernEnvironmentLookupTestParentQueryVariables = {||};
export type RelayModernEnvironmentLookupTestParentQueryResponse = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +$fragmentRefs: RelayModernEnvironmentLookupTestChildFragment$ref,
  |},
|};
export type RelayModernEnvironmentLookupTestParentQuery = {|
  variables: RelayModernEnvironmentLookupTestParentQueryVariables,
  response: RelayModernEnvironmentLookupTestParentQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
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
    "name": "RelayModernEnvironmentLookupTestParentQuery",
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
          (v1/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentLookupTestChildFragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentLookupTestParentQuery",
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
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6010059fc2944af00ae05059b3994294",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentLookupTestParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentLookupTestParentQuery {\n  me {\n    id\n    name\n    ...RelayModernEnvironmentLookupTestChildFragment\n  }\n}\n\nfragment RelayModernEnvironmentLookupTestChildFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "34b779d9c927d69f53328fb1463c2e06";
}

module.exports = node;
