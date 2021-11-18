/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ac9c41e8b161cc40ab560e9551070cf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref = RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType;
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name = RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data;
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data,
>*/);
