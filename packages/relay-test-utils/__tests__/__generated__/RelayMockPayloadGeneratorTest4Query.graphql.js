/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<57c84c9544aa8f894cfe92ba86666593>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest3Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest4Query$variables = {|
  showProfilePicture: boolean,
  hideBirthday: boolean,
  showBirthdayMonth: boolean,
  hideAuthorUsername: boolean,
|};
export type RelayMockPayloadGeneratorTest4QueryVariables = RelayMockPayloadGeneratorTest4Query$variables;
export type RelayMockPayloadGeneratorTest4Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest3Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest4QueryResponse = RelayMockPayloadGeneratorTest4Query$data;
export type RelayMockPayloadGeneratorTest4Query = {|
  variables: RelayMockPayloadGeneratorTest4QueryVariables,
  response: RelayMockPayloadGeneratorTest4Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "hideAuthorUsername"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "hideBirthday"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "showBirthdayMonth"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "showProfilePicture"
},
v4 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest4Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest3Fragment"
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
    "argumentDefinitions": [
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest4Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
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
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v6/*: any*/),
              {
                "alias": "customId",
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "emailAddresses",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "customName",
                "key": "",
                "kind": "ScalarHandle",
                "name": "emailAddresses"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "backgroundImage",
                "plural": false,
                "selections": (v7/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "customBackground",
                "key": "",
                "kind": "LinkedHandle",
                "name": "backgroundImage"
              },
              {
                "condition": "showProfilePicture",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Image",
                    "kind": "LinkedField",
                    "name": "profile_picture",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "hideBirthday",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Date",
                    "kind": "LinkedField",
                    "name": "birthdate",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "year",
                        "storageKey": null
                      },
                      {
                        "condition": "showBirthdayMonth",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "month",
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "hideAuthorUsername",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "author",
                    "plural": false,
                    "selections": [
                      {
                        "alias": "authorID",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "id",
                        "storageKey": null
                      },
                      {
                        "alias": "objectType",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "username",
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
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "33d5297a3ebc999a995d1ec392674619",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest4Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest4Query(\n  $showProfilePicture: Boolean!\n  $hideBirthday: Boolean!\n  $showBirthdayMonth: Boolean!\n  $hideAuthorUsername: Boolean!\n) {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest3Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest3Fragment on User {\n  id\n  name\n  customId: id\n  profile_picture @include(if: $showProfilePicture) {\n    uri\n  }\n  birthdate @skip(if: $hideBirthday) {\n    year\n    month @include(if: $showBirthdayMonth)\n  }\n  author {\n    name\n    id\n  }\n  author @skip(if: $hideAuthorUsername) {\n    authorID: id\n    objectType: __typename\n    username\n    id\n  }\n  allPhones {\n    phoneNumber {\n      displayNumber\n    }\n  }\n  emailAddresses\n  backgroundImage {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9c1756d1dc05632f216b5817ca47e88a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest4Query$variables,
  RelayMockPayloadGeneratorTest4Query$data,
>*/);
