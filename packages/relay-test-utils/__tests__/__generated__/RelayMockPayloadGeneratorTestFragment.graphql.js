/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<58283ce169f0e7d02d5aab47a8b21133>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTestFragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTestFragment$fragmentType: RelayMockPayloadGeneratorTestFragment$ref;
export type RelayMockPayloadGeneratorTestFragment = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
    +width: ?number,
    +height: ?number,
  |},
  +$refType: RelayMockPayloadGeneratorTestFragment$ref,
|};
export type RelayMockPayloadGeneratorTestFragment$data = RelayMockPayloadGeneratorTestFragment;
export type RelayMockPayloadGeneratorTestFragment$key = {
  +$data?: RelayMockPayloadGeneratorTestFragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTestFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTestFragment",
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
  (node/*: any*/).hash = "6bcf93e81ee8984911cf2a69520d4d00";
}

module.exports = node;
