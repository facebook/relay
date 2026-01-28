/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8514610cb4d45ab70bd800aa331faa18>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestUnconditionalQuery$variables = {||};
export type EmptyCheckerTestUnconditionalQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type EmptyCheckerTestUnconditionalQuery = {|
  response: EmptyCheckerTestUnconditionalQuery$data,
  variables: EmptyCheckerTestUnconditionalQuery$variables,
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
        "name": "name",
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
    "name": "EmptyCheckerTestUnconditionalQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "EmptyCheckerTestUnconditionalQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "7430f3c394e0ccbf24b60d98a1dbf2a8",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestUnconditionalQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestUnconditionalQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "62eba03315a7d5b0e05975b51b6ba1f1";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestUnconditionalQuery$variables,
  EmptyCheckerTestUnconditionalQuery$data,
>*/);
