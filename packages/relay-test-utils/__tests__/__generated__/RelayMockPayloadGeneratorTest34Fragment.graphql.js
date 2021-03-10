/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f6b3fbf64ef5f4f3cc9952875e2e1040>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest34Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest34Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest34Fragment$fragmentType: RelayMockPayloadGeneratorTest34Fragment$ref;
export type RelayMockPayloadGeneratorTest34Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayMockPayloadGeneratorTest34Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest34Fragment$data = RelayMockPayloadGeneratorTest34Fragment;
export type RelayMockPayloadGeneratorTest34Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest34Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest34Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest34Fragment",
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
              "documentName": "RelayMockPayloadGeneratorTest34Fragment",
              "fragmentName": "RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "553637d09e8c9ad9977f3acdf7c5717e";
}

module.exports = node;
