/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a00884a62103e7a1d35ddb5107156e07>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest26Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest26Fragment$fragmentType: RelayMockPayloadGeneratorTest26Fragment$ref;
export type RelayMockPayloadGeneratorTest26Fragment = {|
  +uri: ?string,
  +width: ?number,
  +height: ?number,
  +$refType: RelayMockPayloadGeneratorTest26Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest26Fragment$data = RelayMockPayloadGeneratorTest26Fragment;
export type RelayMockPayloadGeneratorTest26Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest26Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest26Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest26Fragment",
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
  "type": "Image",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "52a0092377065d6b742aa9c2a1825484";
}

module.exports = node;
