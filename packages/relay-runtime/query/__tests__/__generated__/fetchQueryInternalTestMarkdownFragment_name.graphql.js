/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<831d7982bd7bfe7ff2651f597ea755c7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestMarkdownFragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestMarkdownFragment_name$ref = fetchQueryInternalTestMarkdownFragment_name$fragmentType;
export type fetchQueryInternalTestMarkdownFragment_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: fetchQueryInternalTestMarkdownFragment_name$fragmentType,
|};
export type fetchQueryInternalTestMarkdownFragment_name = fetchQueryInternalTestMarkdownFragment_name$data;
export type fetchQueryInternalTestMarkdownFragment_name$key = {
  +$data?: fetchQueryInternalTestMarkdownFragment_name$data,
  +$fragmentSpreads: fetchQueryInternalTestMarkdownFragment_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestMarkdownFragment_name",
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
  (node/*: any*/).hash = "c2edebb9e00de6001cf648d7924dff03";
}

module.exports = ((node/*: any*/)/*: Fragment<
  fetchQueryInternalTestMarkdownFragment_name$fragmentType,
  fetchQueryInternalTestMarkdownFragment_name$data,
>*/);
