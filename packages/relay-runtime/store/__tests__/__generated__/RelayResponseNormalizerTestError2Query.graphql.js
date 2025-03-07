/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1b546d5a26fba77d4458052b0e7ff488>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTestError2Query$variables = {||};
export type RelayResponseNormalizerTestError2Query$data = {|
  +me: ?{|
    +id: string,
    +lastName: ?string,
  |},
|};
export type RelayResponseNormalizerTestError2Query = {|
  response: RelayResponseNormalizerTestError2Query$data,
  variables: RelayResponseNormalizerTestError2Query$variables,
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
        "name": "lastName",
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
    "name": "RelayResponseNormalizerTestError2Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTestError2Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "f2f151cc618234e9805058dab6dbef6b",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestError2Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestError2Query {\n  me {\n    id\n    lastName\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "095f7e4f402153eeaefed504f57741be";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestError2Query$variables,
  RelayResponseNormalizerTestError2Query$data,
>*/);
