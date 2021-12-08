/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dc14a10664fc1de7cf027dd675196444>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReferenceMarkerTest3Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayReferenceMarkerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayReferenceMarkerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest3Fragment$fragmentType: FragmentType;
export type RelayReferenceMarkerTest3Fragment$ref = RelayReferenceMarkerTest3Fragment$fragmentType;
export type RelayReferenceMarkerTest3Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType & RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayReferenceMarkerTest3Fragment$fragmentType,
|};
export type RelayReferenceMarkerTest3Fragment = RelayReferenceMarkerTest3Fragment$data;
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
      "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
