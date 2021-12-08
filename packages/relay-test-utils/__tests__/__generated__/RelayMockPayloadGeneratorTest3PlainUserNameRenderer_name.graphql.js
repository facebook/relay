/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<42ad41a18d045413d94c91baefbbeae1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref = RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType;
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name = RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$data;
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "95916093d9fd4a96a90809c85a8b5aa7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$data,
>*/);
