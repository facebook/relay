/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7d99ed93f753b69bab3c222364ebd17b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderRequiredFieldsTest6Fragment$fragmentType } from "./RelayReaderRequiredFieldsTest6Fragment.graphql";
export type RelayReaderRequiredFieldsTest24Query$variables = {||};
export type RelayReaderRequiredFieldsTest24Query$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: RelayReaderRequiredFieldsTest6Fragment$fragmentType,
  |}>,
|};
export type RelayReaderRequiredFieldsTest24Query = {|
  response: RelayReaderRequiredFieldsTest24Query$data,
  variables: RelayReaderRequiredFieldsTest24Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "ids",
    "value": [
      "1",
      "2"
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest24Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReaderRequiredFieldsTest6Fragment"
          }
        ],
        "storageKey": "nodes(ids:[\"1\",\"2\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest24Query",
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
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
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
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "nodes(ids:[\"1\",\"2\"])"
      }
    ]
  },
  "params": {
    "cacheID": "1cf2b88c746e99f6164ed83a5df79a98",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest24Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest24Query {\n  nodes(ids: [\"1\", \"2\"]) {\n    __typename\n    ...RelayReaderRequiredFieldsTest6Fragment\n    id\n  }\n}\n\nfragment RelayReaderRequiredFieldsTest6Fragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9ac143a6a63180abd74a237cb422c2a8";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest24Query$variables,
  RelayReaderRequiredFieldsTest24Query$data,
>*/);
