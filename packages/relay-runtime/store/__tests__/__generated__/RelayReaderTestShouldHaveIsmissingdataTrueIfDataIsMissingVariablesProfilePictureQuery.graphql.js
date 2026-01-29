/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<778663a0ddbc20c886dfd863bb68b217>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery$variables = {||};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery$data = {|
  +me: ?{|
    +id: string,
  |},
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery = {|
  response: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery$data,
  variables: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery$variables,
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
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "aba03ad31bc3122c807d8d4f51828637",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3b3b10704291421f33fcda5e9ed0ac7c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery$variables,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingVariablesProfilePictureQuery$data,
>*/);
