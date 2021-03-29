/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<23e6fce6a4d10624f969551795513547>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$ref;
export type RelayReferenceMarkerTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$ref,
|};
export type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$data = RelayReferenceMarkerTestMarkdownUserNameRenderer_name;
export type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTestMarkdownUserNameRenderer_name",
  "selections": [
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "markup",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3435d059eae2fc726bf5cddeb6431b82";
}

module.exports = node;
