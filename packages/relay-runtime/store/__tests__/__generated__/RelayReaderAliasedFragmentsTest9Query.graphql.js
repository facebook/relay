/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6185b9deb72156ede7d2f95b30fb449b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTest9Query$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTest9Query$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +name: ?string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest9Query = {|
  response: RelayReaderAliasedFragmentsTest9Query$data,
  variables: RelayReaderAliasedFragmentsTest9Query$variables,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "MaybeNodeInterface",
  "abstractKey": "__isMaybeNodeInterface"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTest9Query",
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
            "fragment": (v2/*: any*/),
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
    "name": "RelayReaderAliasedFragmentsTest9Query",
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
    "cacheID": "6e740fd5354e772e6ef042016c733fc6",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest9Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest9Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on MaybeNodeInterface {\n      __isMaybeNodeInterface: __typename\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f6a83095fdd57866c6914999003d4c10";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest9Query$variables,
  RelayReaderAliasedFragmentsTest9Query$data,
>*/);
