/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<124f0c02273f5ad2c7e36f4eb27c490d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest11Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest11Fragment$ref = RelayMockPayloadGeneratorTest11Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest11Fragment$data = {|
  +actor: ?{|
    +id?: string,
    +name?: ?string,
    +profile_picture?: ?{|
      +uri: ?string,
      +height: ?number,
    |},
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest11Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest11Fragment = RelayMockPayloadGeneratorTest11Fragment$data;
export type RelayMockPayloadGeneratorTest11Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest11Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest11Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest11Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
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
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "c7eef6db09d172c3e8e19c04871474dc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest11Fragment$fragmentType,
  RelayMockPayloadGeneratorTest11Fragment$data,
>*/);
