/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<619ec10d1e504f16c0f60a943fe0e43c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
export type readUpdatableQueryTest2UpdatableQuery$variables = {|
  id: string,
|};
export type readUpdatableQueryTest2UpdatableQuery$data = {|
  get node(): ?{|
    +__typename: string,
  |},
  set node(value: null | void): void,
|};
export type readUpdatableQueryTest2UpdatableQuery = {|
  response: readUpdatableQueryTest2UpdatableQuery$data,
  variables: readUpdatableQueryTest2UpdatableQuery$variables,
|};
*/

var node/*: ConcreteUpdatableQuery*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "id"
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryTest2UpdatableQuery",
    "selections": [
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
            "name": "__typename",
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

if (__DEV__) {
  (node/*: any*/).hash = "093b5c34b7f889b8759dda2c3bf97058";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryTest2UpdatableQuery$variables,
  readUpdatableQueryTest2UpdatableQuery$data,
>*/);
