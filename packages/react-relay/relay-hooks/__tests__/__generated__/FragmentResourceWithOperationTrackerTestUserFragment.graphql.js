/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b860f51f9070b2abea432e5508b90944>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @dataDrivenDependency FragmentResourceWithOperationTrackerTestUserFragment.plainNameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref = any;
type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestUserFragment$ref: FragmentReference;
declare export opaque type FragmentResourceWithOperationTrackerTestUserFragment$fragmentType: FragmentResourceWithOperationTrackerTestUserFragment$ref;
export type FragmentResourceWithOperationTrackerTestUserFragment = {|
  +id: string,
  +name: ?string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref & FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref,
  |},
  +plainNameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref,
  |},
  +$refType: FragmentResourceWithOperationTrackerTestUserFragment$ref,
|};
export type FragmentResourceWithOperationTrackerTestUserFragment$data = FragmentResourceWithOperationTrackerTestUserFragment;
export type FragmentResourceWithOperationTrackerTestUserFragment$key = {
  +$data?: FragmentResourceWithOperationTrackerTestUserFragment$data,
  +$fragmentRefs: FragmentResourceWithOperationTrackerTestUserFragment$ref,
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
      "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b3d16c15af5579c578a209cce953b3e2";
}

module.exports = node;
