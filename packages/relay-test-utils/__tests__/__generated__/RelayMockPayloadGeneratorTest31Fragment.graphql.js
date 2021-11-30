/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<da9397e09de9fca0609505b490eb9680>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest31Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType = any;
type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest31Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest31Fragment$ref = RelayMockPayloadGeneratorTest31Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest31Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$fragmentType & RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest31Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest31Fragment = RelayMockPayloadGeneratorTest31Fragment$data;
export type RelayMockPayloadGeneratorTest31Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest31Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest31Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest31Fragment",
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
              "documentName": "RelayMockPayloadGeneratorTest31Fragment",
              "fragmentName": "RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name",
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
              "documentName": "RelayMockPayloadGeneratorTest31Fragment",
              "fragmentName": "RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "2d4dbf4e752eecd5734fbe1f82627dad";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest31Fragment$fragmentType,
  RelayMockPayloadGeneratorTest31Fragment$data,
>*/);
