/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1bd1158bf231cf37bd99e4422ae3012a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderResolverTest2Fragment$fragmentType = any;
export type RelayReaderResolverTest2Query$variables = {||};
export type RelayReaderResolverTest2Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderResolverTest2Fragment$fragmentType,
  |},
|};
export type RelayReaderResolverTest2Query = {|
  response: RelayReaderResolverTest2Query$data,
  variables: RelayReaderResolverTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest2Query",
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
            "name": "RelayReaderResolverTest2Fragment"
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
    "name": "RelayReaderResolverTest2Query",
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
    "cacheID": "3fc0b468947cadd31b9ba82ed8293a9c",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest2Query {\n  me {\n    ...RelayReaderResolverTest2Fragment\n    id\n  }\n}\n\nfragment RelayReaderResolverTest2Fragment on User {\n  ...UserGreetingResolver\n  id\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c0f8fe4d967d2bb6496e8b814a52faa9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest2Query$variables,
  RelayReaderResolverTest2Query$data,
>*/);
