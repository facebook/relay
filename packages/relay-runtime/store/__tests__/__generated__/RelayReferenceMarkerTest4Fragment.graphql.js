/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0dd0642faff46db6fbb4cb68bd6d20e7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReferenceMarkerTest4Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReferenceMarkerTest2PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$ref = any;
type RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest4Fragment$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTest4Fragment$fragmentType: RelayReferenceMarkerTest4Fragment$ref;
export type RelayReferenceMarkerTest4Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref & RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayReferenceMarkerTest4Fragment$ref,
|};
export type RelayReferenceMarkerTest4Fragment$data = RelayReferenceMarkerTest4Fragment;
export type RelayReferenceMarkerTest4Fragment$key = {
  +$data?: RelayReferenceMarkerTest4Fragment$data,
  +$fragmentRefs: RelayReferenceMarkerTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest4Fragment",
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
              "documentName": "RelayReferenceMarkerTest4Fragment",
              "fragmentName": "RelayReferenceMarkerTest2PlainUserNameRenderer_name",
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
              "documentName": "RelayReferenceMarkerTest4Fragment",
              "fragmentName": "RelayReferenceMarkerTest2MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "3d6e8ff98f9447a17bcc393a14e2a4f7";
}

module.exports = node;
