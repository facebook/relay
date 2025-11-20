/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1a9fe20bee41ec1fd5b4cc2d7991f55e>>
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
    "kind": "InlineFragment",
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
  (node/*: any*/).hash = "33578755c95870b57a52adef714a176e";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryTestMissingFieldsUpdatableQuery$variables,
  readUpdatableQueryTestMissingFieldsUpdatableQuery$data,
>*/);
