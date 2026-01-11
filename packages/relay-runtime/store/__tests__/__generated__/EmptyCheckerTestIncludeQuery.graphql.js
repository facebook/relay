/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0d2ac3e27201551d137bc314bc30a716>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestIncludeQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestIncludeQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type EmptyCheckerTestIncludeQuery = {|
  response: EmptyCheckerTestIncludeQuery$data,
  variables: EmptyCheckerTestIncludeQuery$variables,
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
    "name": "EmptyCheckerTestIncludeQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestIncludeQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "208a62d7ec1037e06956691d8402b4f3",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestIncludeQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestIncludeQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "067502796d4f6d6f7cc85e9d1f230356";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestIncludeQuery$variables,
  EmptyCheckerTestIncludeQuery$data,
>*/);
