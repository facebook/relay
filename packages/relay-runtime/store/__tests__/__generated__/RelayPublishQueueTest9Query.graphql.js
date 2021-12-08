/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bd567bea4b808f9733d10c80c4430ff4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayPublishQueueTest3Fragment$fragmentType = any;
export type RelayPublishQueueTest9Query$variables = {||};
export type RelayPublishQueueTest9QueryVariables = RelayPublishQueueTest9Query$variables;
export type RelayPublishQueueTest9Query$data = {|
  +me: ?{|
    +name: ?string,
    +$fragmentSpreads: RelayPublishQueueTest3Fragment$fragmentType,
  |},
  +nodes: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
|};
export type RelayPublishQueueTest9QueryResponse = RelayPublishQueueTest9Query$data;
export type RelayPublishQueueTest9Query = {|
  variables: RelayPublishQueueTest9QueryVariables,
  response: RelayPublishQueueTest9Query$data,
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
    "name": "RelayPublishQueueTest9Query",
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
            "name": "RelayPublishQueueTest3Fragment"
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
    "name": "RelayPublishQueueTest9Query",
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
    "cacheID": "9fbd8b113874aa0e225e4ab757744aac",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest9Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest9Query {\n  me {\n    name\n    ...RelayPublishQueueTest3Fragment\n    id\n  }\n  nodes(ids: [\"4\"]) {\n    __typename\n    name\n    id\n  }\n}\n\nfragment RelayPublishQueueTest3Fragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8c6fb9aff9f2b1d57306984aeeaef2e7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest9Query$variables,
  RelayPublishQueueTest9Query$data,
>*/);
