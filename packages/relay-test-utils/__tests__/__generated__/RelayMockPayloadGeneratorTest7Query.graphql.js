/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<038bedc4f77f72f246504aa40478b52e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest7Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest7Query$variables = {||};
export type RelayMockPayloadGeneratorTest7QueryVariables = RelayMockPayloadGeneratorTest7Query$variables;
export type RelayMockPayloadGeneratorTest7Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest7Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest7QueryResponse = RelayMockPayloadGeneratorTest7Query$data;
export type RelayMockPayloadGeneratorTest7Query = {|
  variables: RelayMockPayloadGeneratorTest7QueryVariables,
  response: RelayMockPayloadGeneratorTest7Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest7Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest7Fragment"
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest7Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "42bf6c51149d4cea25bd41ae89c165d6",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest7Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest7Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest7Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest7Fragment on User {\n  id\n  name\n  profile_picture {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a3c95c433bbd4ee9485da633208ee3c6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest7Query$variables,
  RelayMockPayloadGeneratorTest7Query$data,
>*/);
