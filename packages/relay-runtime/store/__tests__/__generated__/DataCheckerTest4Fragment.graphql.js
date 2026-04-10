/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f5c03c6bc2a1e6900f3f9af5fdfb4f9e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency DataCheckerTest4Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"DataCheckerTestMarkdownUserNameRenderer_nameFragment$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"DataCheckerTestPlainUserNameRenderer_nameFragment$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType } from "./DataCheckerTestMarkdownUserNameRenderer_nameFragment.graphql";
import type { DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType } from "./DataCheckerTestPlainUserNameRenderer_nameFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest4Fragment$fragmentType: FragmentType;
export type DataCheckerTest4Fragment$data = {|
  +id: string,
  +nameRenderer: ?({|
    +__typename: "MarkdownUserNameRenderer",
    +__fragmentPropName: ?string,
    +__module_component: ?string,
    +$fragmentSpreads: DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType,
  |} | {|
    +__typename: "PlainUserNameRenderer",
    +__fragmentPropName: ?string,
    +__module_component: ?string,
    +$fragmentSpreads: DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
  +$fragmentType: DataCheckerTest4Fragment$fragmentType,
|};
export type DataCheckerTest4Fragment$key = {
  +$data?: DataCheckerTest4Fragment$data,
  +$fragmentSpreads: DataCheckerTest4Fragment$fragmentType,
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
      "storageKey": "nameRenderer(supported:\"34hjiS\")"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "f20c2eee0a5b421d96944c9afdd2eb66";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTest4Fragment$fragmentType,
  DataCheckerTest4Fragment$data,
>*/);
