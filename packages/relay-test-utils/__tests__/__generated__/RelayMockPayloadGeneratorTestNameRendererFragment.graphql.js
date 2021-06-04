/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ad6697151d5dfc84afbbd9fad677e5a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTestNameRendererFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTestNameRendererFragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTestNameRendererFragment$fragmentType: RelayMockPayloadGeneratorTestNameRendererFragment$ref;
export type RelayMockPayloadGeneratorTestNameRendererFragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayMockPayloadGeneratorTestNameRendererFragment$ref,
|};
export type RelayMockPayloadGeneratorTestNameRendererFragment$data = RelayMockPayloadGeneratorTestNameRendererFragment;
export type RelayMockPayloadGeneratorTestNameRendererFragment$key = {
  +$data?: RelayMockPayloadGeneratorTestNameRendererFragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTestNameRendererFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTestNameRendererFragment",
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "nameRenderer",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "RelayMockPayloadGeneratorTestNameRendererFragment",
              "fragmentName": "RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "MarkdownUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f0216aa82d1ec98339610e246be542b9";
}

module.exports = node;
