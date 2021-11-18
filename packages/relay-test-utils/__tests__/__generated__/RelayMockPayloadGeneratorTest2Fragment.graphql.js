/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<45fe37298984fafa54ec1a2f6c18453f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest2Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest2Fragment$ref = RelayMockPayloadGeneratorTest2Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest2Fragment$data = {|
  +id: string,
  +name: ?string,
  +author: ?{|
    +myId: string,
    +myUsername: ?string,
    +emailAddresses: ?$ReadOnlyArray<?string>,
    +birthdate: ?{|
      +day: ?number,
      +month: ?number,
      +year: ?number,
    |},
    +id?: string,
    +name?: ?string,
    +authorID?: string,
    +username?: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest2Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest2Fragment = RelayMockPayloadGeneratorTest2Fragment$data;
export type RelayMockPayloadGeneratorTest2Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest2Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "condition"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest2Fragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": "authorID",
          "args": null,
          "kind": "ScalarField",
          "name": "id",
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
    },
    {
      "condition": "condition",
      "kind": "Condition",
      "passingValue": true,
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
              "alias": "myId",
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            },
            {
              "alias": "myUsername",
              "args": null,
              "kind": "ScalarField",
              "name": "username",
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
              "concreteType": "Date",
              "kind": "LinkedField",
              "name": "birthdate",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "day",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "month",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "year",
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "43d399ac3305ca0e9ca98f78e8f3f014";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest2Fragment$fragmentType,
  RelayMockPayloadGeneratorTest2Fragment$data,
>*/);
