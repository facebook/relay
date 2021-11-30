/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<58acf9cc3912f26e479223717181a6c1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @dataDrivenDependency RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.plainNameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$ref = RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType;
export type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$data = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +author: ?{|
    +__typename: string,
    +nameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType & RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
    |},
    +plainNameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
    |},
  |},
  +$fragmentType: RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment = RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$data;
export type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
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
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
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
      "name": "author",
      "plural": false,
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
                  "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
                  "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
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
                  "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
                  "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "MarkdownUserNameRenderer",
              "abstractKey": null
            }
          ],
          "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
        },
        {
          "alias": "plainNameRenderer",
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
                  "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer",
                  "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
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
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e135d9b0559cedee19c4ccccd85dc5be";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$data,
>*/);
