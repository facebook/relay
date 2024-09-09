/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8dcada45472d826c073cbf5a54c1a1cb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderTestWhenMatchDirectiveIsPresentBarFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType } from "./RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name.graphql";
import type { RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType } from "./RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType & RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$data,
  +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType,
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
          "value": "34hjiS"
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
      "storageKey": "nameRenderer(supported:\"34hjiS\")"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d8887b2ac025350aec36b04e349ce12a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$data,
>*/);
