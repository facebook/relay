/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<22f62bb6dcae0acda4bc7f9c3d4ca15e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest32Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType = any;
type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest32Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest32Fragment$ref = RelayMockPayloadGeneratorTest32Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest32Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$fragmentType & RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest32Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest32Fragment = RelayMockPayloadGeneratorTest32Fragment$data;
export type RelayMockPayloadGeneratorTest32Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest32Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest32Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest32Fragment",
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
      "args": [
        {
          "kind": "Literal",
          "name": "supported",
          "value": [
            "PlainUserNameRenderer",
            "MarkdownUserNameRenderer"
          ]
        }
      ],
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
              "documentName": "RelayMockPayloadGeneratorTest32Fragment",
              "fragmentName": "RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "PlainUserNameRenderer",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "RelayMockPayloadGeneratorTest32Fragment",
              "fragmentName": "RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "MarkdownUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9528806b54e9146150a42d893d0f8541";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest32Fragment$fragmentType,
  RelayMockPayloadGeneratorTest32Fragment$data,
>*/);
