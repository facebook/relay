/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1aac3cdc7e6492a7aad77eea8ebeff5f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest33Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest33Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest33Fragment$fragmentType: RelayMockPayloadGeneratorTest33Fragment$ref;
export type RelayMockPayloadGeneratorTest33Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayMockPayloadGeneratorTest33Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest33Fragment$data = RelayMockPayloadGeneratorTest33Fragment;
export type RelayMockPayloadGeneratorTest33Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest33Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest33Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest33Fragment",
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
              "documentName": "RelayMockPayloadGeneratorTest33Fragment",
              "fragmentName": "RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "0a9f2a100bbe2b365105043522aa4c86";
}

module.exports = node;
