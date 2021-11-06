/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<37929f2eaa05c284f286320eac226ea7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayMockPayloadGeneratorTest32Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref = any;
type RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest32Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest32Fragment$fragmentType: RelayMockPayloadGeneratorTest32Fragment$ref;
export type RelayMockPayloadGeneratorTest32Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$ref & RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayMockPayloadGeneratorTest32Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest32Fragment$data = RelayMockPayloadGeneratorTest32Fragment;
export type RelayMockPayloadGeneratorTest32Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest32Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest32Fragment$ref,
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

module.exports = node;
