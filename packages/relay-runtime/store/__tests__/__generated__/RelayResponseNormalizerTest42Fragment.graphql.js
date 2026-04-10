/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f7dbb6dc7870e4d159b538aa288184c6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest42Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest42Fragment$data = {|
  +__typename: "User",
  +id: string,
  +name: ?string,
  +$fragmentType: RelayResponseNormalizerTest42Fragment$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: RelayResponseNormalizerTest42Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest42Fragment$key = {
  +$data?: RelayResponseNormalizerTest42Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest42Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest42Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "User",
      "abstractKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "591f4f73e73d3aa4fa8dbc86ca5c9690";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest42Fragment$fragmentType,
  RelayResponseNormalizerTest42Fragment$data,
>*/);
