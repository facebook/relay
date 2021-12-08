/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<db0c5e265f0c67ba8607e88410f5a091>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest15Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest15Fragment$ref = RelayMockPayloadGeneratorTest15Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest15Fragment$data = {|
  +id: string,
  +name?: ?string,
  +profile_picture: ?{|
    +uri: ?string,
    +width: ?number,
    +height: ?number,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest15Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest15Fragment = RelayMockPayloadGeneratorTest15Fragment$data;
export type RelayMockPayloadGeneratorTest15Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest15Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest15Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "scale"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "withName"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest15Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "withName",
      "kind": "Condition",
      "passingValue": true,
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
};

if (__DEV__) {
  (node/*: any*/).hash = "06a4c1dc01ab784a5010d8555dd41259";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest15Fragment$fragmentType,
  RelayMockPayloadGeneratorTest15Fragment$data,
>*/);
