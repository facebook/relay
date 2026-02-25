/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<80bbcd385f69522f7e379b1d4266a42e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
export type readUpdatableQueryTestMissingFieldsUpdatableQuery$variables = {||};
export type readUpdatableQueryTestMissingFieldsUpdatableQuery$data = {|
  get me(): ?{|
    lastName: ?string,
  |},
  set me(value: null | void): void,
  get node(): ?({|
    +__typename: "User",
    name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
  set node(value: null | void): void,
  get nodes(): ?ReadonlyArray<?({|
    +__typename: "User",
    name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |})>,
  set nodes(value: []): void,
|};
export type readUpdatableQueryTestMissingFieldsUpdatableQuery = {|
  response: readUpdatableQueryTestMissingFieldsUpdatableQuery$data,
  variables: readUpdatableQueryTestMissingFieldsUpdatableQuery$variables,
|};
*/

var node/*: ConcreteUpdatableQuery*/ = (function(){
var v0 = [
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
        "name": "name",
        "storageKey": null
      }
    ],
    "type": "User",
    "abstractKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryTestMissingFieldsUpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "id",
            "value": "4"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v0/*: any*/),
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "ids",
            "value": [
              "4"
            ]
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": (v0/*: any*/),
        "storageKey": "nodes(ids:[\"4\"])"
      },
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
            "name": "lastName",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "UpdatableQuery"
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c5f0695089b38ebe9d316561c8b5432d";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryTestMissingFieldsUpdatableQuery$variables,
  readUpdatableQueryTestMissingFieldsUpdatableQuery$data,
>*/);
