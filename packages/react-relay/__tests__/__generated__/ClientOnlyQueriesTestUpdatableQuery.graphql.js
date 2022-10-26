/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<628c814c146ce36f8b17c47654403092>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
export type ClientOnlyQueriesTestUpdatableQuery$variables = {||};
export type ClientOnlyQueriesTestUpdatableQuery$data = {|
  get defaultSettings(): ?{|
    client_field: ?string,
  |},
  set defaultSettings(value: null | void): void,
|};
export type ClientOnlyQueriesTestUpdatableQuery = {|
  response: ClientOnlyQueriesTestUpdatableQuery$data,
  variables: ClientOnlyQueriesTestUpdatableQuery$variables,
|};
*/

var node/*: ConcreteUpdatableQuery*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientOnlyQueriesTestUpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Settings",
        "kind": "LinkedField",
        "name": "defaultSettings",
        "plural": false,
        "selections": [
          {
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "client_field",
                "storageKey": null
              }
            ]
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
  (node/*: any*/).hash = "0a0119dc9f4fe139042af0839c700351";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  ClientOnlyQueriesTestUpdatableQuery$variables,
  ClientOnlyQueriesTestUpdatableQuery$data,
>*/);
