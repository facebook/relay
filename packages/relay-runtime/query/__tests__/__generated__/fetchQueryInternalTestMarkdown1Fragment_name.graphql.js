/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<599d378cd10935f90bafd4a8973af769>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type fetchQueryInternalTestMarkdown1Fragment_name$ref: FragmentReference;
declare export opaque type fetchQueryInternalTestMarkdown1Fragment_name$fragmentType: fetchQueryInternalTestMarkdown1Fragment_name$ref;
export type fetchQueryInternalTestMarkdown1Fragment_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$refType: fetchQueryInternalTestMarkdown1Fragment_name$ref,
|};
export type fetchQueryInternalTestMarkdown1Fragment_name$data = fetchQueryInternalTestMarkdown1Fragment_name;
export type fetchQueryInternalTestMarkdown1Fragment_name$key = {
  +$data?: fetchQueryInternalTestMarkdown1Fragment_name$data,
  +$fragmentRefs: fetchQueryInternalTestMarkdown1Fragment_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestMarkdown1Fragment_name",
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
  (node/*: any*/).hash = "c23b64d2c536a5ff15a088b0ad49e3b9";
}

module.exports = node;
