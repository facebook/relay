/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<580a3b760cabe29dbcfdd2adb88df75a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref = RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name = RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$data;
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "MarkdownUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "markup",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8d219e47200e186957568da758755c1f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$data,
>*/);
