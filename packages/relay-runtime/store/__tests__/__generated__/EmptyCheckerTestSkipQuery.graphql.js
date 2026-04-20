/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<89963aef8f2db8804d7ce761bd932693>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestSkipQuery$variables = {|
  cond: boolean,
|};
export type EmptyCheckerTestSkipQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type EmptyCheckerTestSkipQuery = {|
  response: EmptyCheckerTestSkipQuery$data,
  variables: EmptyCheckerTestSkipQuery$variables,
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
    "name": "EmptyCheckerTestSkipQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestSkipQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1a6fe76d1dce4c2529d75fd15f76a487",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestSkipQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestSkipQuery(\n  $cond: Boolean!\n) {\n  me @skip(if: $cond) {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bb1061ad86e069cc5d00620f8a3391f2";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestSkipQuery$variables,
  EmptyCheckerTestSkipQuery$data,
>*/);
