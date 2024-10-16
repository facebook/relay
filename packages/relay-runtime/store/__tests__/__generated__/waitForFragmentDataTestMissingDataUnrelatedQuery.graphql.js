/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9fa024c2becb6df8c10ee46a80068c10>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type waitForFragmentDataTestMissingDataUnrelatedQuery$variables = {||};
export type waitForFragmentDataTestMissingDataUnrelatedQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
|};
export type waitForFragmentDataTestMissingDataUnrelatedQuery = {|
  response: waitForFragmentDataTestMissingDataUnrelatedQuery$data,
  variables: waitForFragmentDataTestMissingDataUnrelatedQuery$variables,
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
    "name": "waitForFragmentDataTestMissingDataUnrelatedQuery",
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
    "name": "waitForFragmentDataTestMissingDataUnrelatedQuery",
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
    "cacheID": "2f876ae51e23b32a967e952b172e78e2",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestMissingDataUnrelatedQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestMissingDataUnrelatedQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4e684abe0b870e22bcc7e807aae3bdbe";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestMissingDataUnrelatedQuery$variables,
  waitForFragmentDataTestMissingDataUnrelatedQuery$data,
>*/);
