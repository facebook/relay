/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ed2a54a917ea299de912a88a1f829b63>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest3Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest3Fragment$data = {
  readonly allPhones: ?ReadonlyArray<?{
    readonly phoneNumber: ?{
      readonly displayNumber: ?string,
    },
  }>,
  readonly author: ?{
    readonly authorID: string,
    readonly name?: ?string,
    readonly objectType: "User",
    readonly username: ?string,
  },
  readonly backgroundImage: ?{
    readonly uri: ?string,
  },
  readonly birthdate?: ?{
    readonly month?: ?number,
    readonly year: ?number,
  },
  readonly customId: string,
  readonly emailAddresses: ?ReadonlyArray<?string>,
  readonly id: string,
  readonly name: ?string,
  readonly profile_picture?: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: RelayMockPayloadGeneratorTest3Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest3Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest3Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest3Fragment$fragmentType,
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
    (v0/*:: as any*/),
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
          "selections": (v1/*:: as any*/),
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
        (v0/*:: as any*/)
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
      "selections": (v1/*:: as any*/),
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "07a710f2ca89951dc1275ada481d2fae";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest3Fragment$fragmentType,
  RelayMockPayloadGeneratorTest3Fragment$data,
>*/);
