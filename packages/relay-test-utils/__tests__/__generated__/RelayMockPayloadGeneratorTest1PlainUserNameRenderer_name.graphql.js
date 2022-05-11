/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3ca9a01c383a1c65a7512ac84a3aed2>>
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
export type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType,
|};
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
