/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<886cacc36a3ecdf1dea03cce66be02e1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$data = RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name;
export type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref,
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

module.exports = node;
