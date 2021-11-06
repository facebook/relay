/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<36b66abc889a6068d43da88966dbe56f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest11Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest11Fragment$fragmentType: RelayMockPayloadGeneratorTest11Fragment$ref;
export type RelayMockPayloadGeneratorTest11Fragment = {|
  +actor: ?{|
    +id?: string,
    +name?: ?string,
    +profile_picture?: ?{|
      +uri: ?string,
      +height: ?number,
    |},
  |},
  +$refType: RelayMockPayloadGeneratorTest11Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest11Fragment$data = RelayMockPayloadGeneratorTest11Fragment;
export type RelayMockPayloadGeneratorTest11Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest11Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest11Fragment$ref,
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

module.exports = node;
