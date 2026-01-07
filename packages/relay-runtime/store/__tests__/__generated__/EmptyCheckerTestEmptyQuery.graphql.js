/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7fac2e70e2e418291bfd4a42fa8a2243>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestEmptyQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestEmptyQuery$data = {|
  +me?: ?{|
    +id: string,
  |},
|};
export type EmptyCheckerTestEmptyQuery = {|
  response: EmptyCheckerTestEmptyQuery$data,
  variables: EmptyCheckerTestEmptyQuery$variables,
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
    "name": "EmptyCheckerTestEmptyQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestEmptyQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "177bee18f5e85868923d9d69915ec723",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestEmptyQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestEmptyQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "30757927ae91bbe5bb85fd55a4a49836";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestEmptyQuery$variables,
  EmptyCheckerTestEmptyQuery$data,
>*/);
