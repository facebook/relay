/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f3e53514e1ceddbbe381a4674dee0098>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$variables = {|
  id: string,
|};
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQueryVariables = readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$variables;
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data = {|
  +node: ?{|
    +__typename: string,
  |},
|};
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQueryResponse = readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data;
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQuery = {|
  variables: readUpdatableQueryEXPERIMENTALTest2UpdatableQueryVariables,
  response: readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryEXPERIMENTALTest2UpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "readUpdatableQueryEXPERIMENTALTest2UpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "cacheID": "6dd9b0741d44577f8ad86c75f4e42bf2",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTest2UpdatableQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryEXPERIMENTALTest2UpdatableQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3351f181d26cbfcea5d107d3103ffd55";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$variables,
  readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data,
>*/);
