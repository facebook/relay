/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5773380ef47fa965709fac70fcb7091a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type EmptyCheckerTestStreamQuery$variables = {||};
export type EmptyCheckerTestStreamQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +id: string,
  |}>,
|};
export type EmptyCheckerTestStreamQuery = {|
  response: EmptyCheckerTestStreamQuery$data,
  variables: EmptyCheckerTestStreamQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "ids",
    "value": [
      "1",
      "2",
      "3"
    ]
  }
],
v1 = {
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
    "name": "EmptyCheckerTestStreamQuery",
    "selections": [
      {
        "kind": "Stream",
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "nodes",
            "plural": true,
            "selections": [
              (v1/*: any*/)
            ],
            "storageKey": "nodes(ids:[\"1\",\"2\",\"3\"])"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "EmptyCheckerTestStreamQuery",
    "selections": [
      {
        "if": null,
        "kind": "Stream",
        "label": "EmptyCheckerTestStreamQuery$stream$nodes_1bMTbg",
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
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
              (v1/*: any*/)
            ],
            "storageKey": "nodes(ids:[\"1\",\"2\",\"3\"])"
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "5622375643828f10dee764118b4469cc",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestStreamQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestStreamQuery {\n  nodes(ids: [\"1\", \"2\", \"3\"]) @stream(label: \"EmptyCheckerTestStreamQuery$stream$nodes_1bMTbg\", initial_count: 1) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "abe0b9fbc26f6306cae0c281c30a2e6e";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestStreamQuery$variables,
  EmptyCheckerTestStreamQuery$data,
>*/);
