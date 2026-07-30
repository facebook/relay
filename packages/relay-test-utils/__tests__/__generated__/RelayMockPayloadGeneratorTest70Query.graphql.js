/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e46fe3aea12fd5d12e089c01483e31e4>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest70Query$variables = {
  showDetails: boolean,
};
export type RelayMockPayloadGeneratorTest70Query$data = {
  readonly node: ?({
    readonly __typename: "User",
    readonly allPhones: ?ReadonlyArray<?{
      readonly isVerified: ?boolean,
      readonly phoneNumber?: ?{
        readonly displayNumber: ?string,
      },
    }>,
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other",
  }),
};
export type RelayMockPayloadGeneratorTest70Query = {
  response: RelayMockPayloadGeneratorTest70Query$data,
  variables: RelayMockPayloadGeneratorTest70Query$variables,
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
    "name": "RelayMockPayloadGeneratorTest70Query",
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
    "name": "RelayMockPayloadGeneratorTest70Query",
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
    "cacheID": "5a814c31e4bef94de2f5e86e70b0d930",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest70Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest70Query(\n  $showDetails: Boolean!\n) {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      allPhones {\n        isVerified\n      }\n      allPhones @include(if: $showDetails) {\n        phoneNumber {\n          displayNumber\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "8007b5bff5c2b476130ad96b32739f1f";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayMockPayloadGeneratorTest70Query$variables,
  RelayMockPayloadGeneratorTest70Query$data,
>*/);
