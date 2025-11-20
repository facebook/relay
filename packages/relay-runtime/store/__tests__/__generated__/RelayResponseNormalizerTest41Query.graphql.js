/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1965ae135ea08c9b18046f9643ed0f06>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest41Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest41Query$data = {|
  +node: ?{|
    +__typename: string,
    +emailAddresses?: ?ReadonlyArray<?string>,
    +id: string,
  |},
|};
export type RelayResponseNormalizerTest41Query = {|
  response: RelayResponseNormalizerTest41Query$data,
  variables: RelayResponseNormalizerTest41Query$variables,
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
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
        "name": "__typename",
        "storageKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "emailAddresses",
            "storageKey": null
          }
        ],
        "type": "User",
        "abstractKey": null
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
    "name": "RelayResponseNormalizerTest41Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest41Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f46c4a92011b2ed6e4222a610f749577",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest41Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest41Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      emailAddresses\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3bf9e0ffd23df3d6711a66bca7879ca7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest41Query$variables,
  RelayResponseNormalizerTest41Query$data,
>*/);
