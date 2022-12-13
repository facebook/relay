/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d1cacf95c8fda1da9298e6fa5809c354>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
import type { OpaqueScalarType } from "../OpaqueScalarType";
export type readUpdatableQueryTest1Query$variables = {||};
export type readUpdatableQueryTest1Query$data = {|
  updatable_scalar_field: ?OpaqueScalarType,
|};
export type readUpdatableQueryTest1Query = {|
  response: readUpdatableQueryTest1Query$data,
  variables: readUpdatableQueryTest1Query$variables,
|};
*/

var node/*: ConcreteUpdatableQuery*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryTest1Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatable_scalar_field",
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "UpdatableQuery"
};

if (__DEV__) {
  (node/*: any*/).hash = "67121b98c8a52240b7a99d3c4d26a509";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryTest1Query$variables,
  readUpdatableQueryTest1Query$data,
>*/);
