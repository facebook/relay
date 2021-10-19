/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2840fea14d078014caba0e9992786d0f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency DataCheckerTest5Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"DataCheckerTest5MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"DataCheckerTest5PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type DataCheckerTest5MarkdownUserNameRenderer_name$ref = any;
type DataCheckerTest5PlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest5Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest5Fragment$fragmentType: DataCheckerTest5Fragment$ref;
export type DataCheckerTest5Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: DataCheckerTest5PlainUserNameRenderer_name$ref & DataCheckerTest5MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: DataCheckerTest5Fragment$ref,
|};
export type DataCheckerTest5Fragment$data = DataCheckerTest5Fragment;
export type DataCheckerTest5Fragment$key = {
  +$data?: DataCheckerTest5Fragment$data,
  +$fragmentRefs: DataCheckerTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest5Fragment",
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
              "documentName": "DataCheckerTest5Fragment",
              "fragmentName": "DataCheckerTest5PlainUserNameRenderer_name",
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
              "documentName": "DataCheckerTest5Fragment",
              "fragmentName": "DataCheckerTest5MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "8a7920a2a8ae8065ddf4b46a76f2199c";
}

module.exports = node;
