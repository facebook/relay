/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ca8d1289e9308d637362174c4dfae1d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest34Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest34Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest34Fragment$ref = RelayMockPayloadGeneratorTest34Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest34Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest34Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest34Fragment = RelayMockPayloadGeneratorTest34Fragment$data;
export type RelayMockPayloadGeneratorTest34Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest34Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest34Fragment$fragmentType,
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
              "args": null,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest34Fragment$fragmentType,
  RelayMockPayloadGeneratorTest34Fragment$data,
>*/);
