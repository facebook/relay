/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b6f92ddd7c21025a682f235962724c48>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
export type readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery$variables = {||};
export type readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery$data = {|
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
  get nodes(): ?$ReadOnlyArray<?({|
    +__typename: "User",
    name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |})>,
  set nodes(value: []): void,
|};
export type readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery = {|
  response: readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery$data,
  variables: readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery$variables,
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
    "name": "readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery",
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
  (node/*: any*/).hash = "9f4d223533dd6ace8cb0dc550cd0ed9b";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery$variables,
  readUpdatableQueryEXPERIMENTALTestMissingFieldsUpdatableQuery$data,
>*/);
