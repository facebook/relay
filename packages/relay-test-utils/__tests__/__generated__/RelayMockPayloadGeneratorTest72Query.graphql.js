/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d943ff9137a81ba129dd40e16b0b2809>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest72Query$variables = {};
export type RelayMockPayloadGeneratorTest72Query$data = {
  readonly me: ?{
    readonly allPhones: ?ReadonlyArray<?{
      readonly isVerified: ?boolean,
      readonly phoneNumber?: ?{
        readonly displayNumber: ?string,
      },
    }>,
  },
};
export type RelayMockPayloadGeneratorTest72Query = {
  response: RelayMockPayloadGeneratorTest72Query$data,
  variables: RelayMockPayloadGeneratorTest72Query$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
v1 = {
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
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest72Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
          (v1/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest72Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a1632f5c8f64ae2bf03821882dcd4c13",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest72Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest72Query {\n  me {\n    allPhones {\n      isVerified\n    }\n    ... on Actor {\n      __isActor: __typename\n      allPhones {\n        phoneNumber {\n          displayNumber\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "10885288fd723c757635eb66b86e4b07";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayMockPayloadGeneratorTest72Query$variables,
  RelayMockPayloadGeneratorTest72Query$data,
>*/);
