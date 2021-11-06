/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0b6c4fae43fe8692e7927998a9af3414>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data = RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name;
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "2bcb1c5814f22fd00ade63e70fc1e7ae";
}

module.exports = node;
