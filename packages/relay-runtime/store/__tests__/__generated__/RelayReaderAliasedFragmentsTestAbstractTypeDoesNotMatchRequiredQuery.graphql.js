/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<08dc10522e39988b14cfbf1ca2b0bdfe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +name: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery = {|
  response: RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$data,
  variables: RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$variables,
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
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": (v2/*: any*/),
                  "action": "THROW"
                }
              ],
              "type": "MaybeNodeInterface",
              "abstractKey": "__isMaybeNodeInterface"
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
          }
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
    "name": "RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
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
              (v2/*: any*/)
            ],
            "type": "MaybeNodeInterface",
            "abstractKey": "__isMaybeNodeInterface"
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
    ]
  },
  "params": {
    "cacheID": "09ea54315d68e6eec790cc8a9a23396d",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on MaybeNodeInterface {\n      __isMaybeNodeInterface: __typename\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "05aba3eafee04c7575bde3ff333ed06d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$variables,
  RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$data,
>*/);
