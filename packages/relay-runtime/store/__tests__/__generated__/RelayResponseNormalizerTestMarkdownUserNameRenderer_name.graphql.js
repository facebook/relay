/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1c914b9f0296ff244b534ab1f6df4c12>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "5fe7113966108858b3c342953f47b4d0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType,
  RelayResponseNormalizerTestMarkdownUserNameRenderer_name$data,
>*/);
