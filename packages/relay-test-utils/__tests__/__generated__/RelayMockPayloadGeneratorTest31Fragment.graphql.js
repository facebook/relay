/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<704716e297282a225c31d1542674a1b6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest31Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref = any;
type RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest31Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest31Fragment$fragmentType: RelayMockPayloadGeneratorTest31Fragment$ref;
export type RelayMockPayloadGeneratorTest31Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$ref & RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayMockPayloadGeneratorTest31Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest31Fragment$data = RelayMockPayloadGeneratorTest31Fragment;
export type RelayMockPayloadGeneratorTest31Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest31Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest31Fragment$ref,
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

module.exports = node;
