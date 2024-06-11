/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<be9b38aa09c03a6eb14157262f900241>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @dataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType } from "./FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name.graphql";
import type { FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType } from "./FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestUserFragment$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType & FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
  |},
  +plainNameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
|};
export type FragmentResourceWithOperationTrackerTestUserFragment$key = {
  +$data?: FragmentResourceWithOperationTrackerTestUserFragment$data,
  +$fragmentSpreads: FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceWithOperationTrackerTestUserFragment",
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
      "kind": "ScalarField",
      "name": "name",
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
              "documentName": "FragmentResourceWithOperationTrackerTestUserFragment",
              "fragmentName": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
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
              "documentName": "FragmentResourceWithOperationTrackerTestUserFragment",
              "fragmentName": "FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "MarkdownUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": "nameRenderer(supported:\"34hjiS\")"
    },
    {
      "alias": "plainNameRenderer",
      "args": [
        {
          "kind": "Literal",
          "name": "supported",
          "value": "1AwQS7"
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
              "documentName": "FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer",
              "fragmentName": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "PlainUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": "nameRenderer(supported:\"1AwQS7\")"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b3d16c15af5579c578a209cce953b3e2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceWithOperationTrackerTestUserFragment$fragmentType,
  FragmentResourceWithOperationTrackerTestUserFragment$data,
>*/);
