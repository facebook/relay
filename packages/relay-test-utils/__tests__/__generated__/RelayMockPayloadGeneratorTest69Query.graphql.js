/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<309957a62e905d3425d4f81481e7e955>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest69Query$variables = {||};
export type RelayMockPayloadGeneratorTest69Query$data = {|
  +a: ?{|
    +id: string,
    +name: ?string,
  |},
  +b: ?{|
    +emailAddresses: ?ReadonlyArray<?string>,
    +id: string,
  |},
|};
export type RelayMockPayloadGeneratorTest69Query = {|
  response: RelayMockPayloadGeneratorTest69Query$data,
  variables: RelayMockPayloadGeneratorTest69Query$variables,
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
v1 = [
  {
    "alias": "a",
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
        "name": "name",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": "b",
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
        "name": "emailAddresses",
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
    "name": "RelayMockPayloadGeneratorTest69Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest69Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "aa793dad7066cf4e3f72d5686a723d95",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest69Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest69Query {\n  a: me {\n    id\n    name\n  }\n  b: me {\n    id\n    emailAddresses\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "48d7660f11592357fff0034ab33441bc";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest69Query$variables,
  RelayMockPayloadGeneratorTest69Query$data,
>*/);
