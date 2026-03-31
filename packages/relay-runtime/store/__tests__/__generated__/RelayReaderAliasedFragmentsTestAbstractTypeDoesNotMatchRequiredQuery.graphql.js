/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dd0548e6a2cc28357a722cbfc7366f52>>
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
                  "field": (v2/*:: as any*/),
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
              (v2/*:: as any*/)
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
  (node/*:: as any*/).hash = "05aba3eafee04c7575bde3ff333ed06d";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$variables,
  RelayReaderAliasedFragmentsTestAbstractTypeDoesNotMatchRequiredQuery$data,
>*/);
