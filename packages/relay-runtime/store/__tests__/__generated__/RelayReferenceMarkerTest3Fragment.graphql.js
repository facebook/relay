/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9677a7b555af8559a64e8592728ff78a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReferenceMarkerTest3Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReferenceMarkerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReferenceMarkerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayReferenceMarkerTestMarkdownUserNameRenderer_name.graphql";
import type { RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType } from "./RelayReferenceMarkerTestPlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest3Fragment$fragmentType: FragmentType;
export type RelayReferenceMarkerTest3Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType & RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayReferenceMarkerTest3Fragment$fragmentType,
|};
export type RelayReferenceMarkerTest3Fragment$key = {
  +$data?: RelayReferenceMarkerTest3Fragment$data,
  +$fragmentSpreads: RelayReferenceMarkerTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest3Fragment",
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
              "documentName": "RelayReferenceMarkerTest3Fragment",
              "fragmentName": "RelayReferenceMarkerTestPlainUserNameRenderer_name",
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
              "documentName": "RelayReferenceMarkerTest3Fragment",
              "fragmentName": "RelayReferenceMarkerTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "ca927c87c3cc253d22117ab1e07ec827";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTest3Fragment$fragmentType,
  RelayReferenceMarkerTest3Fragment$data,
>*/);
