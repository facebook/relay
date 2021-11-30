/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<531477956247d1fbfed2c5dd49d50403>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayPublishQueueTest2Fragment$fragmentType = any;
export type RelayPublishQueueTest8Query$variables = {||};
export type RelayPublishQueueTest8QueryVariables = RelayPublishQueueTest8Query$variables;
export type RelayPublishQueueTest8Query$data = {|
  +me: ?{|
    +name: ?string,
    +$fragmentSpreads: RelayPublishQueueTest2Fragment$fragmentType,
  |},
  +nodes: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
|};
export type RelayPublishQueueTest8QueryResponse = RelayPublishQueueTest8Query$data;
export type RelayPublishQueueTest8Query = {|
  variables: RelayPublishQueueTest8QueryVariables,
  response: RelayPublishQueueTest8Query$data,
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
    "name": "RelayPublishQueueTest8Query",
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
            "name": "RelayPublishQueueTest2Fragment"
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
    "name": "RelayPublishQueueTest8Query",
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
    "cacheID": "db587a032ad6c78af3959c18d226fb66",
    "id": null,
    "metadata": {},
    "name": "RelayPublishQueueTest8Query",
    "operationKind": "query",
    "text": "query RelayPublishQueueTest8Query {\n  me {\n    name\n    ...RelayPublishQueueTest2Fragment\n    id\n  }\n  nodes(ids: [\"4\"]) {\n    __typename\n    name\n    id\n  }\n}\n\nfragment RelayPublishQueueTest2Fragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "aff62129ab4598cd1638ff02a71fa1c5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayPublishQueueTest8Query$variables,
  RelayPublishQueueTest8Query$data,
>*/);
