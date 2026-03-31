/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<912ff84d3c8a49525eafb0cffb411a43>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeFragmentTestMissingDataUnrelatedQuery$variables = {||};
export type observeFragmentTestMissingDataUnrelatedQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
|};
export type observeFragmentTestMissingDataUnrelatedQuery = {|
  response: observeFragmentTestMissingDataUnrelatedQuery$data,
  variables: observeFragmentTestMissingDataUnrelatedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestMissingDataUnrelatedQuery",
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
    "name": "observeFragmentTestMissingDataUnrelatedQuery",
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
    "cacheID": "c4537cbcbdeabaa189c59706b1cbb9eb",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestMissingDataUnrelatedQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestMissingDataUnrelatedQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "69f56abde78ccc7dccd76db5fb677488";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  observeFragmentTestMissingDataUnrelatedQuery$variables,
  observeFragmentTestMissingDataUnrelatedQuery$data,
>*/);
