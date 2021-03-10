/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8e092fb7f6f0feea5f7fb233a8b99af4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest8Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest8Fragment$fragmentType: RelayMockPayloadGeneratorTest8Fragment$ref;
export type RelayMockPayloadGeneratorTest8Fragment = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +backgroundImage: ?{|
    +width: ?number,
    +uri: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest8Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest8Fragment$data = RelayMockPayloadGeneratorTest8Fragment;
export type RelayMockPayloadGeneratorTest8Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest8Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest8Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest8Fragment",
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
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "backgroundImage",
      "plural": false,
      "selections": [
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
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "24245e41029753fad23b19317a3a22d9";
}

module.exports = node;
