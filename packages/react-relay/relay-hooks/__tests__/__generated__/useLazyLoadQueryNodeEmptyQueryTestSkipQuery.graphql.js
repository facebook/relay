/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<24c8bbf3a682ae287754c2ee3dddb2be>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useLazyLoadQueryNodeEmptyQueryTestSkipQuery$variables = {|
  skip: boolean,
|};
export type useLazyLoadQueryNodeEmptyQueryTestSkipQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type useLazyLoadQueryNodeEmptyQueryTestSkipQuery = {|
  response: useLazyLoadQueryNodeEmptyQueryTestSkipQuery$data,
  variables: useLazyLoadQueryNodeEmptyQueryTestSkipQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeEmptyQueryTestSkipQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useLazyLoadQueryNodeEmptyQueryTestSkipQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c389f98506d596385468ae1c08660bf3",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeEmptyQueryTestSkipQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeEmptyQueryTestSkipQuery(\n  $skip: Boolean!\n) {\n  me @skip(if: $skip) {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "666b6733664546272667e8eb25198a99";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeEmptyQueryTestSkipQuery$variables,
  useLazyLoadQueryNodeEmptyQueryTestSkipQuery$data,
>*/);
