/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9d0bfa5e03434970a3d21b1fa9913a6c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest71Query$variables = {
  showDetails: boolean,
};
export type RelayMockPayloadGeneratorTest71Query$data = {
  readonly node: ?{
    readonly allPhones?: ?ReadonlyArray<?{
      readonly isVerified: ?boolean,
      readonly phoneNumber?: ?{
        readonly displayNumber: ?string,
      },
    }>,
  },
};
export type RelayMockPayloadGeneratorTest71Query = {
  response: RelayMockPayloadGeneratorTest71Query$data,
  variables: RelayMockPayloadGeneratorTest71Query$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "showDetails"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Phone",
      "kind": "LinkedField",
      "name": "allPhones",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isVerified",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "condition": "showDetails",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Phone",
          "kind": "LinkedField",
          "name": "allPhones",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PhoneNumber",
              "kind": "LinkedField",
              "name": "phoneNumber",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "displayNumber",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest71Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest71Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "885dbe8d46bc5c892926325509426b87",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest71Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest71Query(\n  $showDetails: Boolean!\n) {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      allPhones {\n        isVerified\n      }\n      allPhones @include(if: $showDetails) {\n        phoneNumber {\n          displayNumber\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "9dc9e9e4f89aa6ba1bbc90bfff3e4043";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayMockPayloadGeneratorTest71Query$variables,
  RelayMockPayloadGeneratorTest71Query$data,
>*/);
