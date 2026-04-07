/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<022b0e03fa369a9ae039128a85c2cfd8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestToPromiseFragment$fragmentType } from "./observeFragmentTestToPromiseFragment.graphql";
export type observeFragmentTestToPromiseQuery$variables = {||};
export type observeFragmentTestToPromiseQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestToPromiseFragment$fragmentType,
  |},
|};
export type observeFragmentTestToPromiseQuery = {|
  response: observeFragmentTestToPromiseQuery$data,
  variables: observeFragmentTestToPromiseQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestToPromiseQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "observeFragmentTestToPromiseFragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeFragmentTestToPromiseQuery",
    "selections": [
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
            "name": "name",
            "storageKey": null
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
    "cacheID": "905740a3d37971aa2b697f8f19150dfd",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestToPromiseQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestToPromiseQuery {\n  me {\n    ...observeFragmentTestToPromiseFragment\n    id\n  }\n}\n\nfragment observeFragmentTestToPromiseFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "32313db14569bee17275c8bbabaca147";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  observeFragmentTestToPromiseQuery$variables,
  observeFragmentTestToPromiseQuery$data,
>*/);
