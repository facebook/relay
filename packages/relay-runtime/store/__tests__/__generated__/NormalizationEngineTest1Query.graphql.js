/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<520daf28b365958600978da49815ed51>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type NormalizationEngineTest1Query$variables = {};
export type NormalizationEngineTest1Query$data = {
  readonly me: ?{
    readonly id: string,
    readonly name: ?string,
  },
};
export type NormalizationEngineTest1Query = {
  response: NormalizationEngineTest1Query$data,
  variables: NormalizationEngineTest1Query$variables,
};
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
    "name": "NormalizationEngineTest1Query",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NormalizationEngineTest1Query",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "bba7618620dd440bccba6ad812c60756",
    "id": null,
    "metadata": {},
    "name": "NormalizationEngineTest1Query",
    "operationKind": "query",
    "text": "query NormalizationEngineTest1Query {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "78cf167b1ac60c050e679d5e1a20730e";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  NormalizationEngineTest1Query$variables,
  NormalizationEngineTest1Query$data,
>*/);
