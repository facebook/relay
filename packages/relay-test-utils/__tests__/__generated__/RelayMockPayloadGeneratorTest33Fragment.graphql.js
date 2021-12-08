/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<82d48643f4c2f5e322ed6b575b7ecf76>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest33Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest33Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest33Fragment$ref = RelayMockPayloadGeneratorTest33Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest33Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest33Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest33Fragment = RelayMockPayloadGeneratorTest33Fragment$data;
export type RelayMockPayloadGeneratorTest33Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest33Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest33Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest33Fragment$fragmentType,
  RelayMockPayloadGeneratorTest33Fragment$data,
>*/);
