/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e0481a8ad7a316c54ae4b3a6dc0d37bf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestInlineFragmentConditionalQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestInlineFragmentConditionalQuery$data = {|
  +me?: ?{|
    +id: string,
  |},
|};
export type EmptyCheckerTestInlineFragmentConditionalQuery = {|
  response: EmptyCheckerTestInlineFragmentConditionalQuery$data,
  variables: EmptyCheckerTestInlineFragmentConditionalQuery$variables,
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
    "name": "EmptyCheckerTestInlineFragmentConditionalQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestInlineFragmentConditionalQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "046ed1f5dcc6d25b7ee5452ba134737e",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestInlineFragmentConditionalQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestInlineFragmentConditionalQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0e5e98b82dfa35a36816d57724401157";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestInlineFragmentConditionalQuery$variables,
  EmptyCheckerTestInlineFragmentConditionalQuery$data,
>*/);
