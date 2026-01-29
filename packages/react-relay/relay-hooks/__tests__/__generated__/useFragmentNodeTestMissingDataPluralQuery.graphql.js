/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e72acf3375bf9b8b4099b8d436a061c9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useFragmentNodeTestMissingDataPluralQuery$variables = {|
  ids: ReadonlyArray<string>,
|};
export type useFragmentNodeTestMissingDataPluralQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +__typename: string,
    +id: string,
  |}>,
|};
export type useFragmentNodeTestMissingDataPluralQuery = {|
  response: useFragmentNodeTestMissingDataPluralQuery$data,
  variables: useFragmentNodeTestMissingDataPluralQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "ids",
        "variableName": "ids"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      },
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentNodeTestMissingDataPluralQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useFragmentNodeTestMissingDataPluralQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "524f1fe181129da7aac2675d67d5db51",
    "id": null,
    "metadata": {},
    "name": "useFragmentNodeTestMissingDataPluralQuery",
    "operationKind": "query",
    "text": "query useFragmentNodeTestMissingDataPluralQuery(\n  $ids: [ID!]!\n) {\n  nodes(ids: $ids) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "006b3d806b873faa5e8f50c5cb9d1ee7";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentNodeTestMissingDataPluralQuery$variables,
  useFragmentNodeTestMissingDataPluralQuery$data,
>*/);
