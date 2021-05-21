/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<806dbd5813b4f734c2ecf398ad2a98a4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderTestWhenMatchDirectiveIsPresentBarFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$ref = any;
type RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$ref: FragmentReference;
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$ref;
export type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$ref & RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$ref,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$data = RelayReaderTestWhenMatchDirectiveIsPresentBarFragment;
export type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$data,
  +$fragmentRefs: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestWhenMatchDirectiveIsPresentBarFragment",
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
              "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentBarFragment",
              "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name",
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
              "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentBarFragment",
              "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "d8887b2ac025350aec36b04e349ce12a";
}

module.exports = node;
