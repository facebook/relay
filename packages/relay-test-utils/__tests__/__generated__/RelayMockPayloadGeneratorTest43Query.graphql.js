/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e37c62cf243100bed6d598f2b5cdd88>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest43SubFragment$fragmentType } from "./RelayMockPayloadGeneratorTest43SubFragment.graphql";
export type RelayMockPayloadGeneratorTest43Query$variables = {||};
export type RelayMockPayloadGeneratorTest43Query$data = {|
  +node: ?{|
    +client_code?: ?number,
    +client_name?: ?string,
    +id?: string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest43SubFragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest43Query = {|
  response: RelayMockPayloadGeneratorTest43Query$data,
  variables: RelayMockPayloadGeneratorTest43Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "client_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "client_code",
      "storageKey": null
    }
  ]
},
v3 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest43Query",
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
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              {
                "kind": "Defer",
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RelayMockPayloadGeneratorTest43SubFragment"
                  }
                ]
              },
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
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
    "name": "RelayMockPayloadGeneratorTest43Query",
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
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "if": null,
                "kind": "Defer",
                "label": "RelayMockPayloadGeneratorTest43Query$defer$RelayMockPayloadGeneratorTest43SubFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ]
              },
              (v2/*: any*/)
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
    "cacheID": "5c461212d5bf6ac91f7ac66f263fd734",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "node.client_code": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "node.client_name": (v3/*: any*/),
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "node.name": (v3/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest43Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest43Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      ...RelayMockPayloadGeneratorTest43SubFragment @defer(label: \"RelayMockPayloadGeneratorTest43Query$defer$RelayMockPayloadGeneratorTest43SubFragment\")\n    }\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest43SubFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "09c33ddebc7c4cfa00dd333b78b76f7d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest43Query$variables,
  RelayMockPayloadGeneratorTest43Query$data,
>*/);
