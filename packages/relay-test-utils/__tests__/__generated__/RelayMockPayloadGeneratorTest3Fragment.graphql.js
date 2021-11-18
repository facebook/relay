/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<63f58c272451321970d6b9a315ece573>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest3Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest3Fragment$ref = RelayMockPayloadGeneratorTest3Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest3Fragment$data = {|
  +id: string,
  +name: ?string,
  +customId: string,
  +profile_picture?: ?{|
    +uri: ?string,
  |},
  +birthdate?: ?{|
    +year: ?number,
    +month?: ?number,
  |},
  +author: ?{|
    +authorID: string,
    +objectType: string,
    +username: ?string,
    +name?: ?string,
  |},
  +allPhones: ?$ReadOnlyArray<?{|
    +phoneNumber: ?{|
      +displayNumber: ?string,
    |},
  |}>,
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +backgroundImage: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest3Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest3Fragment = RelayMockPayloadGeneratorTest3Fragment$data;
export type RelayMockPayloadGeneratorTest3Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest3Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "hideAuthorUsername"
    },
    {
      "kind": "RootArgument",
      "name": "hideBirthday"
    },
    {
      "kind": "RootArgument",
      "name": "showBirthdayMonth"
    },
    {
      "kind": "RootArgument",
      "name": "showProfilePicture"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": "customId",
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
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
          "selections": (v1/*: any*/),
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
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
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
      "alias": "emailAddresses",
      "args": null,
      "kind": "ScalarField",
      "name": "__emailAddresses_customName",
      "storageKey": null
    },
    {
      "alias": "backgroundImage",
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "__backgroundImage_customBackground",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "07a710f2ca89951dc1275ada481d2fae";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest3Fragment$fragmentType,
  RelayMockPayloadGeneratorTest3Fragment$data,
>*/);
