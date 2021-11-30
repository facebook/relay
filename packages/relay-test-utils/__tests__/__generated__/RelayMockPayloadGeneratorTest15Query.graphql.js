/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<897719e5d9cf278b53caa9004286af0b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest15Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest15Query$variables = {|
  scale?: ?number,
|};
export type RelayMockPayloadGeneratorTest15QueryVariables = RelayMockPayloadGeneratorTest15Query$variables;
export type RelayMockPayloadGeneratorTest15Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest15Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest15QueryResponse = RelayMockPayloadGeneratorTest15Query$data;
export type RelayMockPayloadGeneratorTest15Query = {|
  variables: RelayMockPayloadGeneratorTest15QueryVariables,
  response: RelayMockPayloadGeneratorTest15Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": 1,
    "kind": "LocalArgument",
    "name": "scale"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest15Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Literal",
                "name": "withName",
                "value": true
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest15Fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest15Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "scale"
                  }
                ],
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "width",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "height",
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
    "cacheID": "e90c997e2e6f815b4e094ae8ea605c18",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest15Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest15Query(\n  $scale: Float = 1\n) {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest15Fragment_3I1js\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest15Fragment_3I1js on User {\n  id\n  name\n  profile_picture(scale: $scale) {\n    uri\n    width\n    height\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bc6005fc100a31baef4ea752b4292268";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest15Query$variables,
  RelayMockPayloadGeneratorTest15Query$data,
>*/);
