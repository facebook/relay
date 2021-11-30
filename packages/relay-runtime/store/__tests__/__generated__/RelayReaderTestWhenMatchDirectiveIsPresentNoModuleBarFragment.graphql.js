/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c5e61c74f38f129fd8cf1fc611997f8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$fragmentType = any;
type RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref = RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$fragmentType & RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment = RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$data;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$data,
  +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment",
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
              "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment",
              "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name",
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
              "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment",
              "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "3171d1e6bd288204b1bbcf964f679bb0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$data,
>*/);
