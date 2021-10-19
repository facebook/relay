/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6e60724803d9c36c4dcba8267356b1a1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest28Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest28Fragment$fragmentType: RelayMockPayloadGeneratorTest28Fragment$ref;
export type RelayMockPayloadGeneratorTest28Fragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
    +width: ?number,
    +height: ?number,
  |},
  +$refType: RelayMockPayloadGeneratorTest28Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest28Fragment$data = RelayMockPayloadGeneratorTest28Fragment;
export type RelayMockPayloadGeneratorTest28Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest28Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest28Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest28Fragment",
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
  (node/*: any*/).hash = "d8def67d724eec4688b6524f536f5946";
}

module.exports = node;
