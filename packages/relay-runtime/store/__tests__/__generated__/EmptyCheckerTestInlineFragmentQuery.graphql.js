/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<be5e47c47d283460bca4a9fb7a78ad91>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestInlineFragmentQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestInlineFragmentQuery$data = {|
  +me?: ?{|
    +id: string,
  |},
|};
export type EmptyCheckerTestInlineFragmentQuery = {|
  response: EmptyCheckerTestInlineFragmentQuery$data,
  variables: EmptyCheckerTestInlineFragmentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  }
],
v1 = [
  {
    "condition": "cond",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
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
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EmptyCheckerTestInlineFragmentQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestInlineFragmentQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ba132513b3262104ed7afeeef7516bb5",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestInlineFragmentQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestInlineFragmentQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "95534d7ecb6393fe2651e6e92c6bcd06";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestInlineFragmentQuery$variables,
  EmptyCheckerTestInlineFragmentQuery$data,
>*/);
