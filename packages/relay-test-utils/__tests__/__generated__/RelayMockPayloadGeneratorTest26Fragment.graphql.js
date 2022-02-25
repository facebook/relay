/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<961dce13d56a1729ca0f9e872766da38>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest26Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest26Fragment$data = {|
  +height: ?number,
  +uri: ?string,
  +width: ?number,
  +$fragmentType: RelayMockPayloadGeneratorTest26Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest26Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest26Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest26Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest26Fragment$fragmentType,
  RelayMockPayloadGeneratorTest26Fragment$data,
>*/);
