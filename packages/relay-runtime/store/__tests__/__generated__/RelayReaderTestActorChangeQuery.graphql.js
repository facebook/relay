/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8dd2841c77f22da917131b3edc8e7e9a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ActorChangePoint } from "react-relay/multi-actor";
type RelayReaderTestActorChangeFragment$fragmentType = any;
export type RelayReaderTestActorChangeQuery$variables = {||};
export type RelayReaderTestActorChangeQueryVariables = RelayReaderTestActorChangeQuery$variables;
export type RelayReaderTestActorChangeQuery$data = {|
  +viewer: ?{|
    +actor: ?ActorChangePoint<{|
      +actor_key: string,
      +$fragmentSpreads: RelayReaderTestActorChangeFragment$fragmentType,
    |}>,
  |},
|};
export type RelayReaderTestActorChangeQueryResponse = RelayReaderTestActorChangeQuery$data;
export type RelayReaderTestActorChangeQuery = {|
  variables: RelayReaderTestActorChangeQueryVariables,
  response: RelayReaderTestActorChangeQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestActorChangeQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "kind": "ActorChange",
            "alias": null,
            "name": "actor",
            "storageKey": null,
            "args": null,
            "fragmentSpread": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayReaderTestActorChangeFragment"
            }
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
    "name": "RelayReaderTestActorChangeQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "kind": "ActorChange",
            "linkedField": {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "actor",
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
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "actor_key",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cc2929f7ee2deb609c210c99c635bd36",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestActorChangeQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestActorChangeQuery {\n  viewer {\n    actor @fb_actor_change {\n      __typename\n      ...RelayReaderTestActorChangeFragment\n      actor_key\n      id\n    }\n  }\n}\n\nfragment RelayReaderTestActorChangeFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "773250516ecbc96c49a303ebd13fe989";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestActorChangeQuery$variables,
  RelayReaderTestActorChangeQuery$data,
>*/);
