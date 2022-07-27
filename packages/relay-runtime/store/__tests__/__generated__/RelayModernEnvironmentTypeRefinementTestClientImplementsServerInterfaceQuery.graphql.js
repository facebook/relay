/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a0deaccc805eec391afa41b8cfba91ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$fragmentType = any;
export type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery$variables = {||};
export type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery$data = {|
  +maybeNodeInterface: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery = {|
  response: RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery$data,
  variables: RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "maybeNodeInterface",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterface"
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
    "name": "RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "maybeNodeInterface",
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
                "name": "id",
                "storageKey": null
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          {
            "kind": "ClientExtension",
            "selections": [
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
                "type": "ClientTypeImplementingServerInterface",
                "abstractKey": null
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f500fd060bc505c303fbcbf1bc8d563d",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery {\n  maybeNodeInterface {\n    __typename\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "d1b9fee9db55547003a0a91f86af1772";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery$variables,
  RelayModernEnvironmentTypeRefinementTestClientImplementsServerInterfaceQuery$data,
>*/);
