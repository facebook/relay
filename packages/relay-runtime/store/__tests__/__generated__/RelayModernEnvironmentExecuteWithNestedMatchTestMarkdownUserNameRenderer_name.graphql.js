/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<84812d32e12d5e7399fc3229b884e58e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name.user.innerRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +user: ?{|
    +innerRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType,
    |},
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name = RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "MarkdownUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": "markup",
          "args": null,
          "kind": "ScalarField",
          "name": "__markup_markup_handler",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": "innerRenderer",
          "args": [
            {
              "kind": "Literal",
              "name": "supported",
              "value": [
                "PlainUserNameRenderer"
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
                  "documentName": "RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name",
                  "fragmentName": "RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "PlainUserNameRenderer",
              "abstractKey": null
            }
          ],
          "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "44c58e2b7f52b082c9fbb6fc18edbfa3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$data,
>*/);
