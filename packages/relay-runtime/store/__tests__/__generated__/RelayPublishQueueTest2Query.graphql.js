/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ea1739d1e98b2d496d86bc260071d6f0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayPublishQueueTest1Fragment$fragmentType } from "./RelayPublishQueueTest1Fragment.graphql";
export type RelayPublishQueueTest2Query$variables = {||};
export type RelayPublishQueueTest2Query$data = {|
  +me: ?{|
    +name: ?string,
    +$fragmentSpreads: RelayPublishQueueTest1Fragment$fragmentType,
  |},
  +nodes: ?ReadonlyArray<?{|
    +name: ?string,
  |}>,
|};
export type RelayPublishQueueTest2Query = {|
  response: RelayPublishQueueTest2Query$data,
  variables: RelayPublishQueueTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  {
    "kind": "Literal",
    "name": "ids",
    "value": [
      "4"
    ]
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayPublishQueueTest2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayPublishQueueTest1Fragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": "nodes(ids:[\"4\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayPublishQueueTest2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v0/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": "nodes(ids:[\"4\"])"
      }
    ]
  },
  "params": {
    "cacheID": "85e7c4416936cf0214713d402b51cdae",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest2Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest2Query {\n  me {\n    name\n    ...RelayPublishQueueTest1Fragment\n    id\n  }\n  nodes(ids: [\"4\"]) {\n    __typename\n    name\n    id\n  }\n}\n\nfragment RelayPublishQueueTest1Fragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9e3fda617497404bfeeca390667294e5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest2Query$variables,
  RelayPublishQueueTest2Query$data,
>*/);
