/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7ca3405bd58411b025f0527d4f0cdb43>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$ref = any;
type RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref: FragmentReference;
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$ref & RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$data = RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$data,
  +$fragmentRefs: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref,
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

module.exports = node;
