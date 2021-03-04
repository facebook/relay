/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1067d8e0db44802cd44d370800e347e9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$data = RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name;
export type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref,
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

module.exports = node;
