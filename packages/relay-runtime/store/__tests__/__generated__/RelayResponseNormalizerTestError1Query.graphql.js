/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d85cecfbfa048c9f4e71ec89a9613ca7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTestError1Query$variables = {||};
export type RelayResponseNormalizerTestError1Query$data = {|
  +me: ?{|
    +__typename: "User",
    +id: string,
  |},
|};
export type RelayResponseNormalizerTestError1Query = {|
  response: RelayResponseNormalizerTestError1Query$data,
  variables: RelayResponseNormalizerTestError1Query$variables,
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
        "name": "__typename",
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
    "name": "RelayResponseNormalizerTestError1Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTestError1Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "96f38b7ac74f9f89da3f24a6a351d3b6",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestError1Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestError1Query {\n  me {\n    id\n    __typename\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8d91123fc080aa66577e44ce8b25b36c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestError1Query$variables,
  RelayResponseNormalizerTestError1Query$data,
>*/);
