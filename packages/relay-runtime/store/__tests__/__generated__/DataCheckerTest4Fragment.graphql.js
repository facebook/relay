/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6625eb7e8803db059cf524ba5fddb661>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency DataCheckerTest4Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"DataCheckerTestMarkdownUserNameRenderer_nameFragment$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"DataCheckerTestPlainUserNameRenderer_nameFragment$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type DataCheckerTestMarkdownUserNameRenderer_nameFragment$ref = any;
type DataCheckerTestPlainUserNameRenderer_nameFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest4Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest4Fragment$fragmentType: DataCheckerTest4Fragment$ref;
export type DataCheckerTest4Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: DataCheckerTestPlainUserNameRenderer_nameFragment$ref & DataCheckerTestMarkdownUserNameRenderer_nameFragment$ref,
  |},
  +$refType: DataCheckerTest4Fragment$ref,
|};
export type DataCheckerTest4Fragment$data = DataCheckerTest4Fragment;
export type DataCheckerTest4Fragment$key = {
  +$data?: DataCheckerTest4Fragment$data,
  +$fragmentRefs: DataCheckerTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest4Fragment",
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
              "documentName": "DataCheckerTest4Fragment",
              "fragmentName": "DataCheckerTestPlainUserNameRenderer_nameFragment",
              "fragmentPropName": "nameFragment",
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
              "documentName": "DataCheckerTest4Fragment",
              "fragmentName": "DataCheckerTestMarkdownUserNameRenderer_nameFragment",
              "fragmentPropName": "nameFragment",
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
  (node/*: any*/).hash = "f20c2eee0a5b421d96944c9afdd2eb66";
}

module.exports = node;
